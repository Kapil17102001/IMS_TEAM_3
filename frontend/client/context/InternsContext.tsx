import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface Intern {
  id: number;
  full_name: string;
  email: string;
  university: string;
  department: string;
  start_date: string;
  end_date: string;
  status: string;
  address: string;
  job_position: string;
  salary: string;
  gender: string;
}

interface InternsContextType {
  interns: Intern[];
  loading: boolean;
  error: string | null;
}

const InternsContext = createContext<InternsContextType | undefined>(undefined);

export const InternsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInterns() {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/interns/?skip=0&limit=100",
          {
            headers: {
              accept: "application/json",
            },
          }
        );
        setInterns(response.data);
      } catch (err) {
        setError("Failed to fetch interns data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchInterns();
  }, []);

  return (
    <InternsContext.Provider value={{ interns, loading, error }}>
      {children}
    </InternsContext.Provider>
  );
};

export const useInterns = () => {
  const context = useContext(InternsContext);
  if (!context) {
    throw new Error("useInterns must be used within an InternsProvider");
  }
  return context;
};