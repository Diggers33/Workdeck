import React, { useState, useEffect } from 'react';
// Import your Workdeck API helpers
import { getUsersSummary, getProjects, getTasks } from './services/workdeckApi';

const ResourcePlanner = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await getUsersSummary();
        const projects = await getProjects();
        const tasks = await getTasks();

        const mappedTeam = users.map(user => {
          const memberTasks = tasks
            .filter(task => task.assignedTo === user.id)
            .map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return {
                id: task.id,
                project: project ? project.name : "Unknown Project",
                activity: task.activity || "",
                task: task.name,
                estimatedHours: task.estimatedHours ?? 0,
                actualHours: task.actualHours ?? 0,
                status: task.status,
              };
            });

          const scheduled = memberTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || "🧑‍💻",
            department: user.department || "",
            capacity: 40,
            scheduled,
            utilization: Math.round((scheduled / 40) * 100),
            tasks: memberTasks,
          };
        });

        setTeamData(mappedTeam);
      } catch (err) {
        setTeamData([]);
        console.error('Error loading team data:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg font-medium">Loading team data...</span>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Resource Planner
      </h1>
      <div className="flex flex-col gap-8">
        {teamData.map(member => (
          <div
            key={member.id}
            className="rounded-xl shadow bg-white p-6 mb-4 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{member.avatar}</span>
              <div>
                <div className="font-semibold text-lg">{member.name}</div>
                <div className="text-sm text-gray-500">{member.department}</div>
              </div>
              <div className={`ml-auto px-4 py-1 rounded-full text-sm font-bold ${getUtilizationColor(member.utilization)}`}>
                {member.utilization}% utilised
              </div>
            </div>
            <div className="mt-4">
              <table className="min-w-full text-sm border-t">
                <thead>
                  <tr>
                    <th className="text-left py-1 pr-4 font-semibold">Project</th>
                    <th className="text-left py-1 pr-4 font-semibold">Activity</th>
                    <th className="text-left py-1 pr-4 font-semibold">Task</th>
                    <th className="text-left py-1 pr-4 font-semibold">Est. Hours</th>
                    <th className="text-left py-1 pr-4 font-semibold">Actual Hours</th>
                    <th className="text-left py-1 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {member.tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-gray-400 py-3">No tasks assigned</td>
                    </tr>
                  ) : (
                    member.tasks.map(task => (
                      <tr key={task.id}>
                        <td className="py-1 pr-4">{task.project}</td>
                        <td className="py-1 pr-4">{task.activity}</td>
                        <td className="py-1 pr-4">{task.task}</td>
                        <td className="py-1 pr-4">{task.estimatedHours}</td>
                        <td className="py-1 pr-4">{task.actualHours}</td>
                        <td className="py-1 pr-4">{task.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcePlanner;
