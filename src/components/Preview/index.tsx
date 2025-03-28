import { useContext, useEffect, useRef, useState } from 'react';
import { PlaygroundContext } from '../../ReactPlayground/PlaygroundContext';
import CompilerWorker from './compiler.worker?worker';
import iframeRaw from './iframe.html?raw';
import { IMPORT_MAP_FILE_NAME } from '@/ReactPlayground/files';
import { Message } from '../Message';
import { debounce } from 'lodash-es';

interface MessageData {
  data: {
    type: string;
    message: string;
  };
}

export default function Preview() {
  const { files } = useContext(PlaygroundContext);
  const [compiledCode, setCompiledCode] = useState('');
  const getIframeUrl = () => {
    const res = iframeRaw
      .replace(
        '<script type="importmap"></script>',
        `<script type="importmap">${files[IMPORT_MAP_FILE_NAME].value}</script>`
      )
      .replace(
        '<script type="module" id="appSrc"></script>',
        `<script type="module" id="appSrc">${compiledCode}</script>`
      );
    return URL.createObjectURL(new Blob([res], { type: 'text/html' }));
  };
  const [iframeUrl, setIframeUrl] = useState(getIframeUrl());
  const compilerWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!compilerWorkerRef.current) {
      compilerWorkerRef.current = new CompilerWorker();
      compilerWorkerRef.current.addEventListener('message', data => {
        console.log('worker', data.data);
        if (data.data.type === 'COMPILED_CODE') {
          console.log('update');

          setCompiledCode(data.data.data);
        }
      });
    }
  }, []);

  useEffect(
    debounce(() => {
      compilerWorkerRef.current?.postMessage(files);
    }, 500),
    [files]
  );

  useEffect(() => {
    setIframeUrl(getIframeUrl());
  }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);

  const [error, setError] = useState('');

  const handleMessage = (msg: MessageData) => {
    const { type, message } = msg.data;
    if (type === 'ERROR') {
      setError(message);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <iframe
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          padding: 0,
          border: 'none',
        }}
      />
      <Message type="warn" content={error} />
    </div>
  );
}
