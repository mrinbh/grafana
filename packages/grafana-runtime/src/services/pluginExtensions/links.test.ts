import { getPluginLink, PluginLinkMissingError } from './links';
import { setPluginsExtensionRegistry } from './registry';

describe('getPluginLink', () => {
  describe('when getting a registered extension link', () => {
    const pluginId = 'grafana-basic-app';
    const linkId = 'declare-incident';

    beforeAll(() => {
      setPluginsExtensionRegistry({
        links: {
          [`${pluginId}.${linkId}`]: {
            description: 'Declaring an incident in the app',
            href: `/a/${pluginId}/declare-incident`,
          },
        },
      });
    });

    it('should return a href to the plugin', () => {
      const { link, error } = getPluginLink({
        id: `${pluginId}.${linkId}`,
      });

      expect(link?.href).toBe(`/a/${pluginId}/declare-incident`);
      expect(error).toBeUndefined();
    });

    it('should return a href to the plugin with query parameters', () => {
      const { link, error } = getPluginLink({
        id: `${pluginId}.${linkId}`,
        queryParams: {
          title: 'my awesome incident',
          level: 2,
        },
      });

      expect(link?.href).toBe(`/a/${pluginId}/declare-incident?title=my%20awesome%20incident&level=2`);
      expect(error).toBeUndefined();
    });

    it('should return a description for the requested link', () => {
      const { link, error } = getPluginLink({
        id: `${pluginId}.${linkId}`,
      });

      expect(link?.href).toBe(`/a/${pluginId}/declare-incident`);
      expect(link?.description).toBe('Declaring an incident in the app');
      expect(error).toBeUndefined();
    });

    it('should return an empty href when link doesnt exist', () => {
      const { link, error } = getPluginLink({
        id: `some-different-app.${linkId}`,
      });

      expect(link?.href).toBeUndefined();
      expect(error).toBeInstanceOf(PluginLinkMissingError);
    });
  });
});
