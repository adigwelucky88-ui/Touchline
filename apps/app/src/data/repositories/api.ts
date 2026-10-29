import {
  athletesGet,
  athletesList,
  athletesVideosFor,
  sportsGet,
  sportsList,
  videosList,
} from '@touchline/api-client';
import type { Athlete, SportDefinition } from '@touchline/core';

import type { AthleteRepository, Repositories, SportRepository, VideoRepository } from './types';

/** Repositories backed by the Touchline API through the generated client. */

const videos: VideoRepository = {
  async list({ sport, skill, cursor }) {
    return (await videosList({ sport, skill, cursor })).data;
  },
  async listForAthlete(handle, { season, cursor }) {
    return (await athletesVideosFor(handle, { season, cursor })).data;
  },
};

const athletes: AthleteRepository = {
  async list({ sport, q, cursor }) {
    return (await athletesList({ sport, q, cursor })).data;
  },
  async get(handle) {
    return (await athletesGet(handle)).data as Athlete;
  },
};

const sports: SportRepository = {
  async list() {
    return (await sportsList()).data as SportDefinition[];
  },
  async get(key) {
    return (await sportsGet(key)).data as SportDefinition;
  },
};

export const apiRepositories: Repositories = { videos, athletes, sports, isSampleData: false };
