// Development configuration for MindSage
export const isDevelopment = process.env.DFX_NETWORK !== "ic";

export const getHost = () => {
  if (isDevelopment) {
    // Use 127.0.0.1 instead of localhost for better compatibility
    return "http://127.0.0.1:4943";
  }
  return "https://ic0.app";
};

export const getIdentityProvider = () => {
  // Always use production Internet Identity for better user experience
  return "https://identity.ic0.app/#authorize";
};

export const createAgentOptions = (identity) => {
  const options = {
    identity,
    host: getHost(),
  };

  return options;
};

export const setupAgent = async (agent) => {
  if (isDevelopment) {
    try {
      // Fetch root key for local development with retries
      let retries = 3;
      while (retries > 0) {
        try {
          await agent.fetchRootKey();
          console.log("Successfully fetched root key for local development");
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.warn("Could not fetch root key after multiple attempts:", error);
            throw error;
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.warn("Root key fetch failed, but continuing anyway:", error);
    }
  }
  return agent;
}; 