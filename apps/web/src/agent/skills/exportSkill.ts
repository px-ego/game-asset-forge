export interface ExportSkillDescriptor {
  name: "export_png" | "export_metadata" | "export_zip" | "export_spritesheet";
  description: string;
}

const availableExportSkills: readonly ExportSkillDescriptor[] = [
  {
    name: "export_png",
    description: "导出单个素材 PNG",
  },
  {
    name: "export_metadata",
    description: "导出本次生成任务的 metadata.json",
  },
  {
    name: "export_zip",
    description: "导出包含素材和 metadata 的 ZIP 资源包",
  },
  {
    name: "export_spritesheet",
    description: "导出当前素材的 Sprite Sheet PNG",
  },
];

export function getAvailableExportSkills(): ExportSkillDescriptor[] {
  return availableExportSkills.map((skill) => ({ ...skill }));
}
