import { SystemDateFormatSettings } from '../datetime';
import { MapLayerOptions } from '../geo/layer';
import { GrafanaTheme2 } from '../themes';

import { DataSourceInstanceSettings } from './datasource';
import { FeatureToggles } from './featureToggles.gen';
import { PanelPluginMeta } from './panel';
import { PluginsExtensionConfig } from './pluginExtensions';

import { GrafanaTheme, IconName, NavLinkDTO, OrgRole } from '.';

/**
 * Describes the build information that will be available via the Grafana configuration.
 *
 * @public
 */
export interface BuildInfo {
  version: string;
  commit: string;
  env: string;
  edition: GrafanaEdition;
  latestVersion: string;
  hasUpdate: boolean;
  hideVersion: boolean;
}

/**
 * @internal
 */
export enum GrafanaEdition {
  OpenSource = 'Open Source',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

/**
 * Describes the license information about the current running instance of Grafana.
 *
 * @public
 */
export interface LicenseInfo {
  expiry: number;
  licenseUrl: string;
  stateInfo: string;
  edition: GrafanaEdition;
  enabledFeatures: { [key: string]: boolean };
  trialExpiry?: number;
}

/**
 * Describes Sentry integration config
 *
 * @public
 */
export interface SentryConfig {
  enabled: boolean;
  dsn: string;
  customEndpoint: string;
  sampleRate: number;
}

/**
 * Describes GrafanaJavascriptAgentConfig integration config
 *
 * @public
 */
export interface GrafanaJavascriptAgentConfig {
  enabled: boolean;
  customEndpoint: string;
  errorInstrumentalizationEnabled: boolean;
  consoleInstrumentalizationEnabled: boolean;
  webVitalsInstrumentalizationEnabled: boolean;
  apiKey: string;
}

export interface UnifiedAlertingConfig {
  minInterval: string;
}

/**
 * Describes the plugins that should be preloaded prior to start Grafana.
 *
 * @public
 */
export type PreloadPlugin = {
  path: string;
  version: string;
};

/** Supported OAuth services
 *
 * @public
 */
export type OAuth =
  | 'github'
  | 'gitlab'
  | 'google'
  | 'generic_oauth'
  // | 'grafananet' Deprecated. Key always changed to "grafana_com"
  | 'grafana_com'
  | 'azuread'
  | 'okta';

/** Map of enabled OAuth services and their respective names
 *
 * @public
 */
export type OAuthSettings = Partial<Record<OAuth, { name: string; icon?: IconName }>>;

/** Current user info included in bootData
 *
 * @internal
 */
export interface CurrentUserDTO {
  isSignedIn: boolean;
  id: number;
  externalUserId: string;
  login: string;
  email: string;
  name: string;
  lightTheme: boolean;
  orgCount: number;
  orgId: number;
  orgName: string;
  orgRole: OrgRole | '';
  isGrafanaAdmin: boolean;
  gravatarUrl: string;
  timezone: string;
  weekStart: string;
  locale: string;
  language: string;
  permissions?: Record<string, boolean>;
}

/** Contains essential user and config info
 *
 * @internal
 */
export interface BootData {
  user: CurrentUserDTO;
  settings: GrafanaConfig;
  navTree: NavLinkDTO[];
  themePaths: {
    light: string;
    dark: string;
  };
}

/**
 * Describes all the different Grafana configuration values available for an instance.
 *
 * @internal
 */
export interface GrafanaConfig {
  pluginExtensions: Record<string, PluginsExtensionConfig>;
  isPublicDashboardView: boolean;
  datasources: { [str: string]: DataSourceInstanceSettings };
  panels: { [key: string]: PanelPluginMeta };
  auth: AuthSettings;
  minRefreshInterval: string;
  appSubUrl: string;
  windowTitlePrefix: string;
  buildInfo: BuildInfo;
  newPanelTitle: string;
  bootData: BootData;
  externalUserMngLinkUrl: string;
  externalUserMngLinkName: string;
  externalUserMngInfo: string;
  allowOrgCreate: boolean;
  disableLoginForm: boolean;
  defaultDatasource: string;
  alertingEnabled: boolean;
  alertingErrorOrTimeout: string;
  alertingNoDataOrNullValues: string;
  alertingMinInterval: number;
  authProxyEnabled: boolean;
  exploreEnabled: boolean;
  queryHistoryEnabled: boolean;
  helpEnabled: boolean;
  profileEnabled: boolean;
  ldapEnabled: boolean;
  sigV4AuthEnabled: boolean;
  azureAuthEnabled: boolean;
  samlEnabled: boolean;
  autoAssignOrg: boolean;
  verifyEmailEnabled: boolean;
  oauth: OAuthSettings;
  rbacEnabled: boolean;
  disableUserSignUp: boolean;
  loginHint: string;
  passwordHint: string;
  loginError?: string;
  viewersCanEdit: boolean;
  editorsCanAdmin: boolean;
  disableSanitizeHtml: boolean;
  liveEnabled: boolean;
  /** @deprecated Use `theme2` instead. */
  theme: GrafanaTheme;
  theme2: GrafanaTheme2;
  pluginsToPreload: PreloadPlugin[];
  featureToggles: FeatureToggles;
  licenseInfo: LicenseInfo;
  http2Enabled: boolean;
  dateFormats?: SystemDateFormatSettings;
  sentry: SentryConfig;
  grafanaJavascriptAgent: GrafanaJavascriptAgentConfig;
  customTheme?: any;
  geomapDefaultBaseLayer?: MapLayerOptions;
  geomapDisableCustomBaseLayer?: boolean;
  unifiedAlertingEnabled: boolean;
  unifiedAlerting: UnifiedAlertingConfig;
  angularSupportEnabled: boolean;
  feedbackLinksEnabled: boolean;
  secretsManagerPluginEnabled: boolean;
  googleAnalyticsId: string | undefined;
  googleAnalytics4Id: string | undefined;
  googleAnalytics4SendManualPageViews: boolean;
  rudderstackWriteKey: string | undefined;
  rudderstackDataPlaneUrl: string | undefined;
  rudderstackSdkUrl: string | undefined;
  rudderstackConfigUrl: string | undefined;
}

export interface AuthSettings {
  OAuthSkipOrgRoleUpdateSync?: boolean;
  SAMLSkipOrgRoleSync?: boolean;
  LDAPSkipOrgRoleSync?: boolean;
  GrafanaComSkipOrgRoleSync?: boolean;
  AzureADSkipOrgRoleSync?: boolean;
  DisableSyncLock?: boolean;
}
