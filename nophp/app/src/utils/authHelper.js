export const apiCall = async (url, method = 'GET', data = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('پێتڤی ب چوونەژوورێ یە');
    }
  
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  
    if (data) {
      options.body = JSON.stringify(data);
    }
  
    const response = await fetch(url, options);
  
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('نیشانا چوونەژوورێ نەدروستە');
    }
  
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'هەڵەیەک رویدا');
    }
  
    return result;
  };
  
  export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };
  
  export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };