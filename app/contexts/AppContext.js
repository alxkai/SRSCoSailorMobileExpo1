import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import useAsyncStorage from '~/utils/useAsyncStorage';
import { getAccessToken, getLoggedInUser } from 'utils/authUtils'
import axios from 'axios'
import { userAccess } from './UAT.js'
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'expo-router';
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth < 500);
        };
      
        handleResize();
      
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    const pathname = usePathname()

    const [testing, setTesting] = useAsyncStorage("testingStatus", false);
    const [token, setToken] = useAsyncStorage("token", null);

    useEffect(() => {
        const isTesting = window.location.href.includes("localhost") 
        setTesting(isTesting);

        const fetchToken = async () => {
          const accessToken = await getAccessToken(isTesting); 
          setToken(accessToken || null);
        };
    
        fetchToken();
    }, []);

    const BASE_URL = "https://cosailor-app-backend-dev.instalily.ai"

    const [salesAgentCD, setSalesAgentCD] = useState('');
    const [custcd, setCustcd] = useState(null);

    useEffect(() => {
      const customerPathMatch = pathname.match(/^\/customer\/(.+)/);
      const customerId = customerPathMatch ? customerPathMatch[1] : null;
      setCustcd(customerId);
    }, [pathname]);

    const [accessInfo, setAccessInfo] = useState(null);

    async function fetchAccessInfo(oktaid) {
      try {
        const response = await axios.get(`${BASE_URL}/get-access-info`, {
          params: { oktaid },
          headers: { Authorization: `Bearer ${token}`}
        });
        console.log('Access info:', response.data);
        return response.data; // Return the fetched data
      } catch (err) {
        console.error('Failed to fetch access info.', err);
        return null; // Return null or handle the error as needed
      }
    }

    const [agentFirstName, setAgentFirstName] = useState('');
    const [agentLastName, setAgentLastName] = useState('');

    const [userFirstName, setUserFirstName] = useState('');
    const [userLastName, setUserLastName] = useState('');

    const [accounts, setAccounts] = useState([]);

    const [user, setUser] = useState(null);

    useEffect(() => {
      const fetchUser = async () => {
        const loggedInUser = await getLoggedInUser(testing);
        setUser(loggedInUser); 
      };
  
      fetchUser();
    }, [testing]);

    const [isAdmin, setIsAdmin] = useState(false);
    const [oktaId, setOktaId] = useState('');
  
    const [persistedAccount, setPersistedAccount] = usePersistedAccount("");
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          // Fetch user and user data
          const userData = await fetchAccessInfo(user.userId);

          setOktaId(user.userId)

          // if TM
          if (userData.srs_role == 'TM') {
            setSalesAgentCD(userData.salesagentcd);
          } else { // if admin or other
            // Use persisted account if available, otherwise use the first account in the list
            const initialAccount = persistedAccount || userData?.tm_list[0].salesagentcd;
            setSalesAgentCD(initialAccount);
            setIsAdmin(true);
            setAccounts(userData.tm_list)
          }
          
          // user - person currently using app 
          setUserFirstName(user.firstName);
          setUserLastName(user.lastName);

          // sales agent - agent currently in selection 
          // TO DO: create a diff useeffect for this if I use it in the app 
          setAgentFirstName(user.firstName);
          setAgentLastName(user.lastName);
  
          datadogRum.setUser({
            id: userData.oktaid,
            name: user.firstName + " " + user.lastName,
            access_level: userData.srs_role,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      if (user && token) {
        fetchUserData();
      }
    }, [testing, persistedAccount, user, token]);

    useEffect(() => {
      console.log("salesAgentCD updated:", salesAgentCD);
      if (salesAgentCD === 'MPARISE') {
        console.log("Matthew Parise is logged in");
      }
      if (salesAgentCD && salesAgentCD !== persistedAccount) {
        setPersistedAccount(salesAgentCD);
      }
    }, [salesAgentCD, persistedAccount, setPersistedAccount]);

    useEffect(() => {
      console.log("salesAgentCD updated:", salesAgentCD);
    }, [salesAgentCD]);

    useEffect(() => {
      if (persistedAccount) {
        setSalesAgentCD(persistedAccount);
      }
    }, [persistedAccount]);

    const [agentProfile, setAgentProfile] = useState('');

    const fetchAgentProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-profile`, {
          params: { salesagentcd: salesAgentCD, oktaid: oktaId },
          headers: { Authorization: `Bearer ${token}`}
        });
  
        if (response.data) {
          setAgentProfile(response.data);
        } else {
          setAgentProfile('')
          console.log(`Customer Profile Page: custcd: ${custcd}: No data returned from the API`);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    useEffect(() => {
      if (!salesAgentCD) return
      fetchAgentProfile()
    }, [salesAgentCD]);

    const editProfile = async (updatedProfile) => {
      try {
        const response = await fetch(`${BASE_URL}/edit-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({...updatedProfile, oktaid: oktaId,}), 
        });
  
        if (response.ok) {
          console.log('Profile successfully edited.');
          setAgentProfile(updatedProfile); // Update the profile in context
        } else {
          console.error('Error editing profile:', response.statusText);
        }
      } catch (err) {
        console.error('Error during the request:', err);
      }
    };

    const logGeneralFeedback = async ( feature, feedback) => {
        try {
          const payload = {
            salesagentcd: salesAgentCD, 
            feature: feature,
            feedback: feedback,
            oktaid: oktaId,
          };
      
          const response = await axios.post(`${BASE_URL}/general-feedback`, payload,{
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',}
          });
          if (response.status === 200) {
            console.log('General feedback successfully logged.');
          } else {
            console.error('Failed to log general feedback:', response.statusText);
          }
        } catch (error) {
          console.error('Error logging general feedback:', error);
        }
    };
    
    const logEvent = async (module, activity, metadata) => {
      try {
        const response = await axios.post(`${BASE_URL}/log-event`, 
          {
            oktaid: oktaId, 
            salesagentcd: salesAgentCD, 
            custcd: custcd,
            module, activity, 
            metadata: metadata,
          },
          { headers: { Authorization: `Bearer ${token}`}
        });
        if (response.data) {
          console.log('Event logged successfully:', response.data);
        } else {
          console.log('Log Event: No response data returned from the API');
        }
      } catch (err) {
        console.log('Error logging event:', err.message);
      }
    };

    const [chatNotification, setChatNotification] = useState(null);

    const sendEmail = async (receiver_emails, cc_emails, bcc_emails, subject, body, attachments ) => {
      const payload = {
        oktaid: oktaId,
        salesagentcd: salesAgentCD,
        receiver_emails: receiver_emails,
        cc_emails: cc_emails,
        bcc_emails: bcc_emails,
        subject: subject,
        body: body,
        attachments: attachments
      };
      console.log("Sending email", payload)
      try { 
        const response = await axios.post(`${BASE_URL}/send-email`, payload,{
          headers: { Authorization: `Bearer ${token}`}
        });
    
        if (response.status === 200) {
          console.log("Email sent successfully:", response.data);
        } else {
          console.error("Error sending email:", response.status);
        }
      } catch (error) {
        console.error("An error occurred:", error.response?.data || error.message);
      }
    };

    const nucliaUpload = async (payload) => {

      const uploadPayload = {
        ...payload,
        file_id: String(uuidv4()),
        oktaid: oktaId,
        salesagentcd: salesAgentCD,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await axios.post(`${BASE_URL}/nuclia-upload`, uploadPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          console.log('Upload logged successfully:', response.data);
        } else {
          console.log('Nuclia Upload: Unexpected status code:', response.status);
        }
      } catch (err) {
        console.log('Error uploading to Nuclia:', err.message);
      }
    };

    const [nucliaFiles, setNucliaFiles] = useState([]);
    
    const getNucliaHistory = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-nuclia-history`, {
          params: { oktaid:oktaId , salesagentcd: salesAgentCD },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          console.log('Upload history retrieved successfully:', response.data);
          setNucliaFiles(response.data)
        } else {
          console.log('Get Nuclia History: Unexpected status code:', response.status);
        }
      } catch (err) {
        console.log('Error fetching Nuclia history:', err.message);
      }
    };

    useEffect(() => {
      if (!salesAgentCD || !oktaId) return
        getNucliaHistory()
    }, [salesAgentCD, oktaId]);
    
    const deleteFile = async (file_id) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/delete-file`,
          { oktaid: oktaId, salesagentcd: salesAgentCD, file_id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          console.log('File deleted successfully:', response.data);
        } else {
          console.log('Delete File: Unexpected status code:', response.status);
        }
      } catch (err) {
        console.log('Error deleting file:', err.message);
      }
    };    
    

    return (
        <AppContext.Provider
        value={{
            isAdmin, custcd, salesAgentCD, BASE_URL, testing, user, agentFirstName, agentLastName, isMobile, accounts,
            setSalesAgentCD, logGeneralFeedback, agentProfile, editProfile, accessInfo, userFirstName, userLastName, oktaId,
            logEvent, token, chatNotification, sendEmail, nucliaUpload, nucliaFiles, deleteFile
        }}
        >
        {children}
        </AppContext.Provider>
    );
};

