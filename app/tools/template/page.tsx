"use client";

import { useState, useMemo } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Copy, Save, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  content: string;
}

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Email Template",
      content: "Hi {{name}},\n\nI hope this email finds you well. I wanted to reach out regarding {{subject}}.\n\n{{body}}\n\nBest regards,\n{{sender}}"
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(templates[0]);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState(templates[0]?.content || "");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // Extract variables from template content
  const variables = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(templateContent)) !== null) {
      if (!matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }, [templateContent]);

  // Generate output with variable substitution
  const generatedOutput = useMemo(() => {
    let output = templateContent;
    variables.forEach(variable => {
      const value = variableValues[variable] || `{{${variable}}}`;
      output = output.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), value);
    });
    return output;
  }, [templateContent, variableValues, variables]);

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateName,
      content: templateContent
    };
    
    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    toast.success("Template saved successfully");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(templates[0] || null);
      setTemplateContent(templates[0]?.content || "");
    }
    toast.success("Template deleted");
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateContent(template.content);
    setVariableValues({});
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedOutput);
    toast.success("Generated text copied to clipboard");
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const exportTemplatesJSON = useMemo(() => {
    return JSON.stringify(templates, null, 2);
  }, [templates]);

  const copyExportJSON = () => {
    navigator.clipboard.writeText(exportTemplatesJSON);
    toast.success("Templates JSON copied to clipboard");
  };

  const handleImportTemplates = () => {
    if (!importText.trim()) {
      toast.error("Please enter JSON data to import");
      return;
    }

    try {
      const importedTemplates = JSON.parse(importText) as Template[];
      
      // Validate the imported data
      if (!Array.isArray(importedTemplates)) {
        throw new Error("Invalid format: Expected an array of templates");
      }
      
      // Check if templates have required properties
      const validTemplates = importedTemplates.filter(t => 
        t.id && t.name && typeof t.content === 'string'
      );
      
      if (validTemplates.length === 0) {
        throw new Error("No valid templates found in the data");
      }
      
      // Merge with existing templates, avoiding duplicates
      const existingIds = new Set(templates.map(t => t.id));
      const newTemplates = validTemplates.filter(t => !existingIds.has(t.id));
      
      setTemplates(prev => [...prev, ...newTemplates]);
      toast.success(`Imported ${newTemplates.length} templates successfully`);
      
      if (newTemplates.length < validTemplates.length) {
        toast.info(`${validTemplates.length - newTemplates.length} templates were skipped (duplicates)`);
      }
      
      setImportText("");
      setImportModalOpen(false);
      
    } catch {
      toast.error("Failed to import templates. Please check the JSON format.");
    }
  };

  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Generators", href: "#" },
          { title: "Template Tool", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Template Tool</h1>
              <p className="text-muted-foreground">
                Create and manage text templates with variables. Use {"{{"} and {"}}"} to wrap variable names.
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Export Templates</DialogTitle>
                    <DialogDescription>
                      Copy the JSON below to backup your templates or share them with others.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={exportTemplatesJSON}
                    readOnly
                    className="h-64 font-mono text-xs"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={copyExportJSON}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Import Templates</DialogTitle>
                    <DialogDescription>
                      Paste the templates JSON data below to import them.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Paste your templates JSON here..."
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="h-64 font-mono text-xs"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportTemplates}>
                      Import Templates
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-200px)]">
          {/* Column 1: Template Editor and Selector */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Saved Templates</Label>
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center gap-2">
                    <Button
                      variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      size="sm"
                      className="flex-1 justify-start text-left"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      {template.name}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Create New Template</Label>
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <Button onClick={handleSaveTemplate} size="sm" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>

            <div className="space-y-3 flex-1">
              <Label className="text-sm font-medium">Template Editor</Label>
              <Textarea
                placeholder="Enter your template here. Use {{variable}} for variables..."
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="h-64 font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground">
                Variables found: {variables.length > 0 ? variables.join(", ") : "None"}
              </div>
            </div>
          </div>

          {/* Column 2: Variable Inputs */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Variable Values</Label>
            {variables.length > 0 ? (
              <div className="space-y-3">
                {variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label className="text-sm">{variable}</Label>
                    <Textarea
                      placeholder={`Enter value for ${variable}`}
                      value={variableValues[variable] || ""}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No variables found in template</p>
                <p className="text-xs mt-2">Add variables using {"{{"} and {"}}"} syntax</p>
              </div>
            )}
          </div>

          {/* Column 3: Generated Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Generated Text</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!generatedOutput.trim()}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="border rounded-md p-3 h-96 overflow-auto bg-muted/50">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedOutput || "Generated text will appear here..."}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground">
              {variables.filter(v => variableValues[v]).length} of {variables.length} variables filled
            </div>
          </div>
        </div>
      </div>
    </>
  );
}