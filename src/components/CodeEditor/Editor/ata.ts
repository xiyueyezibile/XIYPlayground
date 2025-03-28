import { setupTypeAcquisition } from '@typescript/ata';
import typescriprt from 'typescript';
// 编辑器第三方包代码提示，在编辑器 mount 时运行这段代码
export function createATA(onDownloadFile: (code: string, path: string) => void) {
  const ata = setupTypeAcquisition({
    projectName: 'my-ata',
    typescript: typescriprt,
    logger: console,
    delegate: {
      receivedFile: (code, path) => {
        console.log('自动下载的包', path);
        onDownloadFile(code, path);
      },
    },
  });

  return ata;
}
