// src/components/ResourcePlanner.js
import React, { useState, useEffect } from 'react';
import WorkdeckAPI from '../services/workdeckApi';
import { DataTransformer } from '../services/dataTransformer';

const ResourcePlanner = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workdeckAPI] = useState(new WorkdeckAPI());

  // Your existing component logic here...
  // Use the API to load real data instead of dummy data

  const loadWorkdeckData = async () => {
    setLoading(true);
    try {
      const [usersResponse, projectsResponse] = await Promise.all([
        workdeckAPI.getUsers(),
        workdeckAPI.getProjects()
      ]);

      const users = usersResponse.result || [];
      const projects = projectsResponse.result || [];

      const teamMembers = DataTransformer.transformUsersToTeamMembers(
        users, projects, {}
      );

      setTeamData(teamMembers);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component...
};

export default ResourcePlanner;
