/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IKibanaResponse, Logger } from '@kbn/core/server';
import { buildRouteValidationWithZod } from '@kbn/zod-helpers';
import { SIEM_RULE_MIGRATION_STOP_PATH } from '../../../../../common/siem_migrations/constants';
import {
  StopRuleMigrationRequestParams,
  type StopRuleMigrationResponse,
} from '../../../../../common/siem_migrations/model/api/rules/rule_migration.gen';
import type { SecuritySolutionPluginRouter } from '../../../../types';
import { SiemMigrationAuditLogger, SiemMigrationsAuditActions } from './util/audit';
import { withLicense } from './util/with_license';

export const registerSiemRuleMigrationsStopRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger
) => {
  router.versioned
    .put({
      path: SIEM_RULE_MIGRATION_STOP_PATH,
      access: 'internal',
      security: { authz: { requiredPrivileges: ['securitySolution'] } },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: { params: buildRouteValidationWithZod(StopRuleMigrationRequestParams) },
        },
      },
      withLicense(
        async (context, req, res): Promise<IKibanaResponse<StopRuleMigrationResponse>> => {
          const migrationId = req.params.migration_id;
          let siemMigrationAuditLogger: SiemMigrationAuditLogger | undefined;
          try {
            const ctx = await context.resolve(['securitySolution']);
            const auditLogger = ctx.securitySolution.getAuditLogger();
            if (auditLogger) {
              siemMigrationAuditLogger = new SiemMigrationAuditLogger(auditLogger);
            }
            const ruleMigrationsClient = ctx.securitySolution.getSiemRuleMigrationsClient();

            const { exists, stopped } = await ruleMigrationsClient.task.stop(migrationId);

            if (!exists) {
              return res.noContent();
            }
            siemMigrationAuditLogger?.log({
              action: SiemMigrationsAuditActions.SIEM_MIGRATION_STOPPED,
              id: migrationId,
            });

            return res.ok({ body: { stopped } });
          } catch (err) {
            logger.error(err);
            siemMigrationAuditLogger?.log({
              action: SiemMigrationsAuditActions.SIEM_MIGRATION_STOPPED,
              error: err,
              id: migrationId,
            });
            return res.badRequest({ body: err.message });
          }
        }
      )
    );
};
