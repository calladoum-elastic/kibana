/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { z } from 'zod';

import type { SettingsConfig } from './types';

export const zodStringWithDurationValidation = z
  .string()
  .refine((val) => val.match(/^(\d+[s|m|h|d])?$/), {
    message: i18n.translate(
      'xpack.fleet.settings.agentPolicyAdvanced.downloadTimeoutValidationMessage',
      {
        defaultMessage: 'Must be a string with a time unit, e.g. 30s, 5m, 2h, 1d',
      }
    ),
  });

export const AGENT_POLICY_ADVANCED_SETTINGS: SettingsConfig[] = [
  {
    name: 'agent.limits.go_max_procs',
    title: i18n.translate('xpack.fleet.settings.agentPolicyAdvanced.goMaxProcsTitle', {
      defaultMessage: 'GO_MAX_PROCS',
    }),
    description: i18n.translate('xpack.fleet.settings.agentPolicyAdvanced.goMaxProcsDescription', {
      defaultMessage: 'Limits the maximum number of CPUs that can be executing simultaneously',
    }),
    learnMoreLink:
      'https://www.elastic.co/guide/en/fleet/current/enable-custom-policy-settings.html#limit-cpu-usage',
    api_field: {
      name: 'agent_limits_go_max_procs',
    },
    schema: z.number().int().min(0).default(0),
  },
];
