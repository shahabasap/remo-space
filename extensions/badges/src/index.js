import axios from 'axios';

const BASE_URL = 'https://stale-olivette-rashidpathiyil-d5cc9ac4.koyeb.app/api/v1';

export default {
  id: 'badges-extension',
  handler: (router) => {
	router.get('/',(req,res)=>res.send("hello world"))
    // Create Event endpoint - POST /badges/event
    router.post('/event', async (req, res) => {
      try {
        console.log('Received request body:', req.body); // Debug log
        
        const { event_type, user_id, payload, timestamp } = req.body;
        
        if (!event_type || !user_id || !payload) {
          console.log('Validation failed - missing required fields');
          return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['event_type', 'user_id', 'payload']
          });
        }

        const eventData = {
          event_type,
          user_id,
          payload,
          timestamp: timestamp || new Date().toISOString()
        };

        console.log('Sending to API:', eventData); // Debug log
        const response = await axios.post(`${BASE_URL}/events`, eventData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API response:', response.data); // Debug log
        res.json(response.data);
      } catch (error) {
        console.error('Error:', error); // Debug log
        
        if (error.response) {
          console.error('API error response:', {
            status: error.response.status,
            data: error.response.data
          });
          res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
          res.status(502).json({ error: 'No response from upstream server' });
        } else {
          res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
          });
        }
      }
    });

    // Get User Events endpoint - GET /badges/event/:user_id
    router.get('/event/:user_id', async (req, res) => {
      try {
        console.log('Fetching events for user:', req.params.user_id); // Debug log
        console.log('Query params:', req.query); // Debug log
        
        const { user_id } = req.params;
        const { event_type, start_date, end_date, limit, offset } = req.query;
        
        const params = new URLSearchParams();
        if (event_type) params.append('event_type', event_type);
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        params.append('limit', limit || 50);
        params.append('offset', offset || 0);

        const url = `${BASE_URL}/users/${user_id}/events?${params.toString()}`;
        console.log('Request URL:', url); // Debug log
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        res.json(response.data);
      } catch (error) {
        console.error('Error:', error); // Debug log
        
        if (error.response) {
          res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
          res.status(502).json({ error: 'No response from upstream server' });
        } else {
          res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
          });
        }
      }
    });
  }
};