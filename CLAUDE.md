# ECWU Toolkit - Layout Design & Guidelines

## Project Overview

A collection of commonly used developer and utility tools with a consistent sidebar navigation and page-specific navbar system.

## Layout Architecture

### Root Layout (`app/layout.tsx`)

- Integrates `SidebarProvider`, `AppSidebar`, and `SidebarInset`
- Global layout structure that wraps all pages
- Handles font loading and basic HTML structure

### Sidebar Component (`components/app-sidebar.tsx`)

- **Client Component** (uses `"use client"` directive)
- Contains searchable navigation for all tools
- Organized into collapsible categories
- Real-time search functionality filters tools by name

### Navbar Component (`components/app-navbar.tsx`)

- Flexible breadcrumb navigation
- Each page can customize its breadcrumb trail
- Includes sidebar trigger and consistent header styling

## Tool Categorization Guidelines

**IMPORTANT**: Most tools listed in the sidebar are placeholders and NOT implemented. Only implement tools that are actually needed.

### When to Create a New Tool

Only create tools that you will actually use frequently. Consider:

- **Personal workflow needs**: Tools that solve problems you encounter regularly
- **Development efficiency**: Tools that speed up common development tasks
- **Unique functionality**: Tools not easily found elsewhere or need customization

### Category Guidelines

Choose the most appropriate category for your tool:

#### Text Tools

- String manipulation and formatting
- Encoding/decoding operations
- Text analysis and processing
- Examples: Regex Tester, JSON Formatter, Base64 Encoder

#### Converters

- Unit conversions (length, weight, temperature, etc.)
- Data format conversions
- Color format conversions
- Examples: Unit Converter, Color Converter, Timestamp Converter

#### Generators

- Creating random or structured data
- Code generation helpers
- ID and token generation
- Examples: Password Generator, UUID Generator

#### Developer Tools

- Code formatting and validation
- Development workflow helpers
- API and debugging tools
- Examples: JWT Decoder, CSS Formatter

#### Utilities

- General purpose tools
- File operations
- Text analysis
- Examples: Text Diff Checker, Word Counter

## Adding New Tools - Required Steps

### 1. Update Sidebar Navigation

**ALWAYS** update the `data.navMain` array in `components/app-sidebar.tsx`:

```tsx
// Add to appropriate category
{
  title: "Your New Tool",
  url: "/tools/your-new-tool",
}
```

### 2. Create Tool Page Structure

Each tool page **MUST** follow this pattern:

```tsx
import { AppNavbar } from "@/components/app-navbar";

export default function YourToolPage() {
  return (
    <>
      <AppNavbar
        breadcrumbs={[
          { title: "Category Name", href: "#" },
          { title: "Your Tool Name", isActive: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Your tool content */}
      </div>
    </>
  );
}
```

### 3. Breadcrumb Guidelines

- Always include at least 2 breadcrumb items
- First item should be the category name
- Last item should be the current tool (with `isActive: true`)
- Use descriptive titles that match the sidebar navigation

### 4. Content Container

- Use `flex flex-1 flex-col gap-4 p-4` for consistent spacing
- This ensures proper layout within the sidebar/navbar structure

## Layout Preferences

### Tool Layout Design

**Preferred Layout Style**: Clean, card-free design without heavy wrapper components

- **Avoid**: Card wrappers (`<Card>`, `<CardHeader>`, `<CardContent>`) for main tool containers
- **Use instead**: Simple div containers with clean typography
- **Header pattern**: 
  ```tsx
  <div className="space-y-2">
    <h1 className="text-2xl font-bold">Tool Name</h1>
    <p className="text-muted-foreground">Tool description...</p>
  </div>
  ```

### Adaptive Grid Layouts

For tools with multiple components, use adaptive grid layouts:

- **Small screens**: Single column (stacked layout)
- **Large screens**: Multi-column layout using CSS Grid
- **Breakpoint**: Use `lg:grid-cols-{n}` for responsive behavior
- **Components**: Group related functionality into distinct grid areas

**Example Structure**:
```tsx
<div className="grid gap-4 lg:grid-cols-3">
  <div className="lg:col-span-1">{/* Component 1 */}</div>
  <div className="lg:col-span-1">{/* Component 2 */}</div>
  <div className="lg:col-span-1">{/* Component 3 */}</div>
</div>
```

### Visual Design Principles

- **Minimal containers**: Avoid unnecessary visual boundaries
- **Clean spacing**: Use consistent gap and padding classes
- **Direct layouts**: Let content flow naturally without heavy framing
- **Responsive first**: Design for mobile, enhance for desktop

## Search Functionality

- Implemented in `components/search-form.tsx`
- Filters tools in real-time as user types
- Searches across all tool names in the sidebar
- Shows "No tools found" message when no matches exist

## File Structure Convention

```text
app/
├── layout.tsx              # Root layout with sidebar integration
├── page.tsx               # Home page
└── tools/
    ├── regex/
    │   └── page.tsx       # Only implement if needed
    ├── unit-converter/
    │   └── page.tsx       # Only implement if needed
    └── [tool-name]/
        └── page.tsx       # Each tool in its own directory

components/
├── app-sidebar.tsx        # Main sidebar with navigation
├── app-navbar.tsx         # Flexible breadcrumb navbar
└── search-form.tsx        # Search functionality
```

## Development Workflow

1. **Assess need**: Only implement tools you'll actually use
2. **Choose category**: Select appropriate category from guidelines above
3. **Update sidebar**: Add entry to `app-sidebar.tsx` navigation
4. **Create page**: Follow the required page structure pattern
5. **Test navigation**: Ensure search and breadcrumbs work correctly

## Key Reminders

- **Only implement tools you need** - most sidebar items are placeholders
- **Always** update the sidebar when adding new tools
- **Always** use `AppNavbar` with appropriate breadcrumbs
- **Always** use the consistent content container structure
- Search functionality will automatically include new tools once added to sidebar
- Remove unused placeholder tools from sidebar as needed