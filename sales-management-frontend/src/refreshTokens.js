import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const refreshTokens = async () => {
  const refreshToken = Cookies.get('refresh_token');
  if (!refreshToken) {
    toast.error('No refresh token available');
    return;
  }

  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/refresh_token/`, {
      refresh_token: refreshToken,
    });

    if (response.status === 200) {
      Cookies.set('access_token', response.data.access);
      Cookies.set('refresh_token', response.data.refresh);
    }
  } catch (error) {
    console.error('Token refresh failed', error);
    
  }
};

export default refreshTokens;