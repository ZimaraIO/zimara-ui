import Editor from '@monaco-editor/react';
import { useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface IYAMLEditor {
  handleChanges: (newYaml: string) => void;
  yamlData?: string;
}

const YAMLEditor = ({ yamlData, handleChanges }: IYAMLEditor) => {
  const editorRef = useRef(null);

  function handleEditorChange(value?: string) {
    debounced(value);
  }

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  function handleEditorValidation(markers: any[]) {
    // Model Markers
    markers.forEach((marker) => console.log('onValidate: ', marker.message));
  }

  const debounced = useDebouncedCallback((value?: string) => {
    if (value) {
      handleChanges(value);
    }
  }, 800);

  return (
    <>
      <Editor
        height="90vh"
        defaultLanguage="yaml"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        onValidate={handleEditorValidation}
        theme={'vs-dark'}
        value={yamlData}
      />
    </>
  );
};

export { YAMLEditor };
