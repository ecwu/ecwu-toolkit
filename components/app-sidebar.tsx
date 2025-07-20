"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";

import { SearchForm } from "@/components/search-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Text Tools",
      url: "#",
      items: [
        {
          title: "Regex Tester",
          url: "/tools/regex",
        },
        {
          title: "Text Formatter",
          url: "/tools/text-formatter",
        },
        {
          title: "Base64 Encoder/Decoder",
          url: "/tools/base64",
        },
        {
          title: "URL Encoder/Decoder",
          url: "/tools/url-encoder",
        },
        {
          title: "JSON Formatter",
          url: "/tools/json-formatter",
        },
        {
          title: "Markdown Preview",
          url: "/tools/markdown",
        },
      ],
    },
    {
      title: "Converters",
      url: "#",
      items: [
        {
          title: "Unit Converter",
          url: "/tools/unit-converter",
        },
        {
          title: "Color Converter",
          url: "/tools/color-converter",
        },
        {
          title: "Number Base Converter",
          url: "/tools/number-base",
        },
        {
          title: "Timestamp Converter",
          url: "/tools/timestamp",
        },
        {
          title: "Currency Converter",
          url: "/tools/currency",
        },
      ],
    },
    {
      title: "Generators",
      url: "#",
      items: [
        {
          title: "Password Generator",
          url: "/tools/password-generator",
        },
        {
          title: "UUID Generator",
          url: "/tools/uuid-generator",
        },
        {
          title: "QR Code Generator",
          url: "/tools/qr-code",
        },
        {
          title: "Lorem Ipsum Generator",
          url: "/tools/lorem-ipsum",
        },
        {
          title: "Hash Generator",
          url: "/tools/hash-generator",
        },
      ],
    },
    {
      title: "Developer Tools",
      url: "#",
      items: [
        {
          title: "JWT Decoder",
          url: "/tools/jwt-decoder",
        },
        {
          title: "CSS Formatter",
          url: "/tools/css-formatter",
        },
        {
          title: "SQL Formatter",
          url: "/tools/sql-formatter",
        },
        {
          title: "Image Optimizer",
          url: "/tools/image-optimizer",
        },
        {
          title: "API Tester",
          url: "/tools/api-tester",
        },
      ],
    },
    {
      title: "Utilities",
      url: "#",
      items: [
        {
          title: "Text Diff Checker",
          url: "/tools/text-diff",
        },
        {
          title: "File Hash Checker",
          url: "/tools/file-hash",
        },
        {
          title: "Word Counter",
          url: "/tools/word-counter",
        },
        {
          title: "Case Converter",
          url: "/tools/case-converter",
        },
        {
          title: "Text Cleanup",
          url: "/tools/text-cleanup",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const filtered = data.navMain.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((category) => category.items.length > 0);

    return { navMain: filtered };
  }, [searchQuery]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="https://cdn.ecwuuuuu.com/assets/img/ecwu.color.svg" 
            alt="Logo" 
            className="h-8 w-24"
          />
          <span className="font-semibold text-lg">Tools</span>
        </div>
        <SearchForm onSearch={setSearchQuery} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {filteredData.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
        {filteredData.navMain.length === 0 && searchQuery && (
          <div className="p-4 text-center text-muted-foreground">
            No tools found for "{searchQuery}"
          </div>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
