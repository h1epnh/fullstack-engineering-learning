export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`http://localhost:3000/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return await response.json(); // Return the result for further handling
}; 