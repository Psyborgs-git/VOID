// ProjectPort.ts
export interface ProjectPort {
  saveProject(projectId: string): Promise<void>;
  loadProject(projectId: string): Promise<void>;
  exportProject(projectId: string, path: string): Promise<void>;
}
