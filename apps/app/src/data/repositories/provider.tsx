import { configureApiClient } from '@touchline/api-client';
import { createContext, useContext, type ReactNode } from 'react';

import { apiRepositories } from './api';
import { fixtureRepositories } from './fixtures';
import type { Repositories } from './types';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (apiUrl) {
  // TODO(phase 4): pass the Cognito session's access token via getAccessToken.
  configureApiClient({ baseUrl: apiUrl });
}

/** API when EXPO_PUBLIC_API_URL is set, otherwise the prototype's sample data. */
export const defaultRepositories: Repositories = apiUrl ? apiRepositories : fixtureRepositories;

const RepositoryContext = createContext<Repositories>(defaultRepositories);

export function RepositoryProvider({ value, children }: { value?: Repositories; children: ReactNode }) {
  return <RepositoryContext.Provider value={value ?? defaultRepositories}>{children}</RepositoryContext.Provider>;
}

export function useRepositories(): Repositories {
  return useContext(RepositoryContext);
}
