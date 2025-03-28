import { useContext } from 'react';
import Editor from './Editor';
import FileNameList from './FileNameList';
import { PlaygroundContext } from '@/ReactPlayground/PlaygroundContext';
import { debounce } from 'lodash-es';

export default function CodeEditor() {
  const { files, theme, setFiles, selectedFileName } = useContext(PlaygroundContext);
  const file = files[selectedFileName];

  function onEditorChange(value?: string) {
    files[file.name].value = value!;
    setFiles({ ...files });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <FileNameList />
      <Editor
        options={{
          theme: `vs-${theme}`,
        }}
        file={file}
        onChange={debounce(onEditorChange, 500)}
      />
    </div>
  );
}
