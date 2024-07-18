


export const getApisData = async () => {
  try {
    const response = await fetch('http://localhost:8000/apis');
    if (!response.ok) {
      throw new Error('Failed to fetch APIs');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to retrieve APIs:', error);
  }
};