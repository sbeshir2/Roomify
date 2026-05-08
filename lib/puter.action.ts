import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

const PROJECT_PREFIX = 'roomify_project_';

export const signIn = async () => await puter.auth.signIn();
export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    const user = await puter.auth.getUser() as { username: string; uuid: string } | null;
    return user;
  } catch { return null; }
};

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null> => {
  try {
    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ? await uploadImageToHosting({
      hosting, url: item.sourceImage, projectId, label: 'source',
    }) : null;

    const hostedRender = projectId && item.renderedImage ? await uploadImageToHosting({
      hosting, url: item.renderedImage, projectId, label: 'rendered',
    }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');
    if (!resolvedSource) {
      console.warn('Failed to host source image, skipping save.');
      return null;
    }

    const resolvedRender = hostedRender?.url
      ? hostedRender.url
      : item.renderedImage && isHostedUrl(item.renderedImage)
        ? item.renderedImage
        : undefined;

    const { sourcePath: _s, renderedPath: _r, publicPath: _p, ...rest } = item;

    const payload = {
      ...rest,
      sourceImage: resolvedSource,
      renderedImage: resolvedRender,
      updatedAt: new Date().toISOString(),
    };

    await (puter.kv as any).set(`${PROJECT_PREFIX}${projectId}`, JSON.stringify(payload));
    return payload as DesignItem;
  } catch (e) {
    console.error('Failed to save project', e);
    return null;
  }
};

export const getProjects = async () => {
  try {
    const entries = await (puter.kv as any).list(PROJECT_PREFIX, true) as any[];
    return (entries || []).map((entry: any) => {
      try { return typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value; }
      catch { return null; }
    }).filter(Boolean);
  } catch (e) {
    console.error('Failed to get projects', e);
    return [];
  }
};

export const getProjectById = async ({ id }: { id: string }) => {
  try {
    const value = await (puter.kv as any).get(`${PROJECT_PREFIX}${id}`) as string | null;
    if (!value) return null;
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    console.error('Failed to get project', e);
    return null;
  }
};