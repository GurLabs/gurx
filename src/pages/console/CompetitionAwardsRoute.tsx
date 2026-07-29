import React from 'react';
import { useCompetition } from '../../components/console/CompetitionLayout';
import { ConsoleAwardsPage } from './AccountPages';

/** "Ödüllerim" reached from inside a competition, scoped to that competition. */
export const CompetitionAwardsRoute: React.FC = () => {
  const { competition } = useCompetition();
  return <ConsoleAwardsPage competitionId={competition.id} eyebrow={competition.title} />;
};
