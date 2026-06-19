import { useCallback, useMemo, useRef, useState } from 'react';
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
} from '@codesandbox/sandpack-react';
import type { CodingLab } from '@/types';

type TestNode = {
  tests?: Record<string, { status: string }>;
  describes?: Record<string, TestNode>;
};

function countTests(node: TestNode): { total: number; passed: number } {
  const own = Object.values(node.tests ?? {});
  const nested = Object.values(node.describes ?? {}).map(countTests);
  return {
    total: own.length + nested.reduce((sum, item) => sum + item.total, 0),
    passed: own.filter((test) => test.status === 'pass').length + nested.reduce((sum, item) => sum + item.passed, 0),
  };
}

export default function CodeRunner({
  lab,
  onAttempt,
  onComplete,
}: {
  lab: CodingLab;
  onAttempt: (passed: number, total: number) => void;
  onComplete: () => void;
}) {
  const completedRef = useRef(false);
  const [result, setResult] = useState({ passed: 0, total: 0 });
  const [resetKey, setResetKey] = useState(0);
  const extension = lab.language === 'typescript' ? 'ts' : 'js';
  const solutionPath = `/${lab.entryFile ?? lab.fileName ?? `solution.${extension}`}`;
  const testPath = `/${lab.testFile ?? `solution.test.${extension}`}`;
  const files = useMemo(() => ({
    [solutionPath]: { code: lab.boilerplateCode, active: true },
    [testPath]: { code: lab.testCode, hidden: true, readOnly: true },
  }), [lab.boilerplateCode, lab.testCode, solutionPath, testPath]);

  const handleComplete = useCallback((specs: Record<string, TestNode>) => {
    const counts = Object.values(specs).map(countTests).reduce(
      (total, item) => ({ total: total.total + item.total, passed: total.passed + item.passed }),
      { total: 0, passed: 0 },
    );
    setResult(counts);
    onAttempt(counts.passed, counts.total);
    if (counts.total > 0 && counts.passed === counts.total && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onAttempt, onComplete]);

  if (!navigator.onLine) {
    return <div className="runner-offline">Connect to the internet to execute tests. Your code and instructions remain available offline.</div>;
  }

  return (
    <div className="code-runner">
      <SandpackProvider
        key={resetKey}
        template={lab.language === 'typescript' ? 'vanilla-ts' : 'vanilla'}
        files={files}
        options={{ activeFile: solutionPath, visibleFiles: [solutionPath] }}
        theme="dark"
      >
        <SandpackLayout>
          <SandpackCodeEditor showTabs={false} showLineNumbers closableTabs={false} />
          <SandpackConsole standalone />
        </SandpackLayout>
        <SandpackTests watchMode verbose onComplete={handleComplete} showVerboseButton={false} showWatchButton={false} />
      </SandpackProvider>
      <button className="btn btn-ghost btn-sm" onClick={() => {
        completedRef.current = false;
        setResult({ passed: 0, total: 0 });
        setResetKey((current) => current + 1);
      }}>Reset starter code</button>
      <p className={result.total > 0 && result.passed === result.total ? 'runner-result runner-result--pass' : 'runner-result'}>
        {result.total ? `${result.passed}/${result.total} tests passing` : 'Tests will run automatically as you edit.'}
      </p>
    </div>
  );
}
