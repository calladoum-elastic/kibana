/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

export const GET_TIMELINE_DISCOVER_SAVED_SEARCH_TITLE = (title: string) =>
  i18n.translate('xpack.securitySolution.timelines.discoverInTimeline.discoverSessionTitle', {
    defaultMessage: 'Saved Discover session for timeline - {title}',
    values: { title },
  });
