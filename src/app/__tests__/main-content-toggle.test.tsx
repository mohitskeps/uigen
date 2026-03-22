import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "../main-content";

// Mock the Tabs components to make them testable in JSDOM
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div role="tablist" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    value: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <button role="tab" data-value={value} onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

// Mock heavy child components
vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat Interface</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-panel-group">{children}</div>
  ),
  ResizablePanel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="resizable-panel">{children}</div>
  ),
  ResizableHandle: () => <div data-testid="resizable-handle" />,
}));

vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useFileSystem: vi.fn(),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useChat: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders Preview tab as active by default", () => {
  render(<MainContent />);

  // Preview frame should be visible by default
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Code editor should not be visible
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking Code tab shows code editor and hides preview", () => {
  render(<MainContent />);

  // Find and click the Code tab
  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);

  // Code editor should now be visible
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Preview frame should not be visible
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("clicking Preview tab after Code shows preview and hides code editor", () => {
  render(<MainContent />);

  // Switch to Code view
  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);

  // Verify code editor is visible
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to Preview
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  fireEvent.click(previewTab);

  // Preview frame should be visible
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Code editor should not be visible
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("toggle renders both Preview and Code tab buttons", () => {
  render(<MainContent />);

  expect(screen.getByRole("tab", { name: "Preview" })).toBeDefined();
  expect(screen.getByRole("tab", { name: "Code" })).toBeDefined();
});

test("file tree is visible in code view", () => {
  render(<MainContent />);

  // Switch to Code view
  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);

  // File tree should be visible
  expect(screen.getByTestId("file-tree")).toBeDefined();
});
