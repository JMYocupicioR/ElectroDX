import React from 'react';
import { NCSResults } from '../types/study';

interface NerveValuesTableProps {
  results: NCSResults;
}

const NerveValuesTable: React.FC<NerveValuesTableProps> = ({ results }) => {
  const nerves = Object.keys(results);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nervio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Latencia (ms)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amplitud (mV/μV)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Velocidad (m/s)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {nerves.map((nerve) => {
            const nerveData = results[nerve];
            return (
              <tr key={nerve} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {nerve}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nerveData.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nerveData.latency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nerveData.amplitude}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {nerveData.velocity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    nerveData.status === 'normal' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {nerveData.status === 'normal' ? 'Normal' : 'Anormal'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NerveValuesTable; 