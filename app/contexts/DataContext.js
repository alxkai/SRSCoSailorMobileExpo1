import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from './AppContext';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { salesAgentCD, BASE_URL, custcd, isAdmin, oktaId, token } = useContext(AppContext);
  
  const [customerInsights, setCustomerInsights] = useState([]);
  const [customerProfilePage, setCustomerProfilePage] = useState({});
  const [customerDailySales, setCustomerDailySales] = useState([]);
  const [customerConfig, setCustomerConfig] = useState({});
  const [customerRebate, setCustomerRebate] = useState({});

  const fetchCustomerRebate = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-rebate-info`, {
        params: { salesagentcd: salesAgentCD, custcd, oktaid: oktaId },
        headers: { Authorization: `Bearer ${token}`}
      });

      if (response.data && Object.keys(response.data).length > 0) {
        console.log(response.data)
        setCustomerRebate(Object.values(response.data));
      } else {
        setCustomerRebate({});
        console.log(`Customer Insights: custcd: ${custcd}: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };


  const fetchCustomerInsights = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-customer-insights`, {
        params: { salesagentcd: salesAgentCD, custcd, oktaid: oktaId },
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      setCustomerInsights(Object.values(response.data));
    } catch (err) {
      console.error('Error loading customer insights:', err);
      setCustomerInsights([]);
    }
  }

  const fetchCustomerProfilePage = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-customer-profile-page`, {
        params: { salesagentcd: salesAgentCD, custcd, oktaid: oktaId },
        headers: { Authorization: `Bearer ${token}`}
      });

      if (response.data) {
        setCustomerProfilePage(response.data);
      } else {
        setCustomerProfilePage({});
        console.log(`Customer Profile Page: custcd: ${custcd}: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const fetchCustomerDailySales = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-customer-daily-sales`, {
        params: { salesagentcd: salesAgentCD, custcd, oktaid: oktaId  },
        headers: { Authorization: `Bearer ${token}`}
      });

      if (response.data && Object.keys(response.data).length > 0) {
        setCustomerDailySales(Object.values(response.data));
      } else {
        setCustomerDailySales([])
        console.log(`Customer Daily Sales: custcd: ${custcd}: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const fetchCustConfig = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-config`, {
        params: { salesagentcd: salesAgentCD, custcd, oktaid: oktaId },
        headers: { Authorization: `Bearer ${token}`}
      });

      if (response.data) {
        setCustomerConfig(response.data[0]);
      } else {
        setCustomerConfig({})
        console.log(`Customer Profile Page: custcd: ${custcd}: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  useEffect(() => {
    if (!salesAgentCD || !custcd) return;

    fetchCustomerInsights();
    fetchCustomerProfilePage();
    fetchCustomerDailySales();
    fetchCustConfig()
    fetchCustomerRebate()
  }, [salesAgentCD, custcd, isAdmin]);

  const [customerReportData, setCustomerReportData] = useState([]);
  const [customerReportPriorityData, setCustomerReportPriorityData] = useState([]);

  const [aggregateInsights, setAggregateInsights] = useState([]);
  const [insightPercent, setInsightPercent] = useState([]);
  const [sales30, setSales30] = useState(null);
  const [salesYear, setSalesYear] = useState(null);
  
  const fetchCustomerReportData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-customer-report-table`, {
        params: {
          salesagentcd: salesAgentCD, oktaid: oktaId 
        },
        headers: { Authorization: `Bearer ${token}`}
      });

      if (response.data && Object.keys(response.data).length > 0) {
        // sort by insight_ranking
        const modifiedData = response.data.sort((a, b) => a.insight_ranking - b.insight_ranking);
        const filteredData = modifiedData.filter(item => item.insight_ranking != null);
        setCustomerReportData(modifiedData)
        setCustomerReportPriorityData(filteredData)
      } else {
        setCustomerReportData([])
        setCustomerReportPriorityData([])
        console.log(`Customer Report Table: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const fetchAggregateInsights = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-aggregate-insights`, {
        params: {
          salesagentcd: salesAgentCD, oktaid: oktaId 
        },
        headers: { Authorization: `Bearer ${token}`}
      });
      if (response.data && response.data.aggregate_insights && Object.keys(response.data.aggregate_insights).length > 0) {
        setAggregateInsights(response.data.aggregate_insights);
        setInsightPercent(response.data.insight_percentages);
        setSales30(response.data.total_t30d_sales);
        setSalesYear(response.data.total_ytd_sales);
      } else {
        setAggregateInsights([]);
        setInsightPercent([]);
        setSales30('');
        setSalesYear('');
        console.log(`Aggregate Insights: No data returned from the API`);
      }
    } catch (err) {
      console.error('Error loading aggregate insights:', err);
    }
  };

  useEffect(() => {
    if (!salesAgentCD) return;

    fetchAggregateInsights();
    fetchCustomerReportData();

  }, [salesAgentCD, isAdmin]);

  const editCustomerConfig = async (payload) => {
    try {
      payload.salesagentcd = salesAgentCD
      payload.oktaid = oktaId;
      const response = await axios.post(`${BASE_URL}/edit-config`, payload,{headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Customer config successfully edited.');
        fetchCustConfig() // Refresh customer config data
      } else {
        console.error('Failed to edit customer config:', response.statusText);
      }
    } catch (error) {
      console.error('Error editing customer config:', error);
    }
  };

  const logInsightFeedback = async (taskid, rating, feedback) => {
    //if (isAdmin) return
    try {
      const payload = {
        taskid: taskid,          // The task ID for which the rating is to be logged
        rating: rating,          // true for thumbs up, false for thumbs down, or null
        feedback: feedback,       // Feedback text or null
        oktaid: oktaId 
      };
  
      const response = await axios.post(`${BASE_URL}/insight-feedback`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Insight feedback successfully logged.');
        fetchCustomerInsights()
      } else {
        console.error('Failed to log insight feedback:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging insight feedback:', error);
    }
  };
  
  const completeInsight = async (task_id) => {
    //if (isAdmin) return
    try {
      const payload = {
        task_id: task_id,  // The task ID for the particular insight (cannot be empty or null)
        oktaid: oktaId 
      };
  
      const response = await axios.post(`${BASE_URL}/complete-insight`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Insight marked as completed.');
        fetchCustomerInsights()
      } else {
        console.error('Failed to mark insight as completed:', response.statusText);
      }
    } catch (error) {
      console.error('Error marking insight as completed:', error);
    }
  };
  
  const rejectInsight = async (task_id) => {
    //if (isAdmin) return
    try {
      const payload = {
        task_id: task_id,  // The task ID for the particular insight (cannot be empty or null)
        oktaid: oktaId 
      };
  
      const response = await axios.post(`${BASE_URL}/reject-insight`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Insight rejected and logged.');
      } else {
        console.error('Failed to reject insight:', response.statusText);
      }
    } catch (error) {
      console.error('Error rejecting insight:', error);
    }
  };

  const snoozeInsight = async (taskid, snooze_date) => {
    try {
      const payload = { taskid, snooze_date, oktaid: oktaId, salesagentcd: salesAgentCD, custcd: custcd};
  
      const response = await axios.post(`${BASE_URL}/snooze-insight`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Insight snoozed successfully.');
        fetchCustomerInsights()
      } else {
        console.error('Failed to snooze insight:', response.statusText);
      }
    } catch (error) {
      console.error('Error snoozing insight:', error);
    }
  };

  const removeSnoozeInsight = async (taskid ) => {
    try {
      const payload = { taskid, oktaid: oktaId, oktaId, salesagentcd: salesAgentCD, custcd: custcd };
  
      const response = await axios.post(`${BASE_URL}/remove-snooze-insight`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Snooze status for insight removed successfully.');
        fetchCustomerInsights()
      } else {
        console.error('Failed to remove snooze status for insight:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing snooze status for insight:', error);
    }
  };
  
  const snoozeCustomer = async (snooze_date, passInCustcd ) => {
    try {
      const payload = { snooze_date, oktaid: oktaId, oktaId, salesagentcd: salesAgentCD, custcd: passInCustcd };

      const response = await axios.post(`${BASE_URL}/snooze-customer`, payload, {headers: { Authorization: `Bearer ${token}`}});
      if (response.status === 200) {
        console.log('Customer snoozed successfully.');
      } else {
        console.error('Failed to snooze customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error snoozing customer:', error);
    }
  };

  const removeSnoozeCustomer = async ( passInCustcd) => {
    try {
      const payload = { oktaid: oktaId, oktaId, salesagentcd: salesAgentCD, custcd: passInCustcd };

      const response = await axios.post(`${BASE_URL}/remove-snooze-customer`, payload, { headers: { Authorization: `Bearer ${token}`} });
      if (response.status === 200) {
        console.log('Snooze status for customer removed successfully.');
      } else {
        console.error('Failed to remove snooze status for customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing snooze status for customer:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      customerInsights,
      setCustomerInsights,
      customerProfilePage,
      customerDailySales,
      customerReportPriorityData,
      customerReportData,
      aggregateInsights,
      insightPercent,
      sales30,
      salesYear,
      customerConfig,
      editCustomerConfig,
      rejectInsight,
      completeInsight,
      logInsightFeedback,
      snoozeInsight,
      removeSnoozeInsight,
      snoozeCustomer,
      removeSnoozeCustomer,
      setCustomerReportData,
      customerRebate,
      fetchCustomerInsights
    }}>
      {children}
    </DataContext.Provider>
  );
};
