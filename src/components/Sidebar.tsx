import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Brain
} from 'lucide-react';


const Sidebar = () => {
  const [pageComponents, setPageComponents] = useState<{ [key: string]: React.ComponentType }>({});
  const excludedPages = ["Login", "Signup"];

  useEffect(() => {
    const fetchPages = async () => {
      const pageModules = import.meta.glob('/src/pages/*.tsx');
      const loadedComponents: { [key: string]: React.ComponentType } = {};

      for (const path in pageModules) {
        const pageName = path.match(/\/src\/pages\/(.+)\.tsx/)?.[1];
        if (pageName && !excludedPages.includes(pageName)) {
          const module = await pageModules[path]();
          loadedComponents[pageName] = (module as any).default;
        }
      }
      setPageComponents(loadedComponents);
    };
    fetchPages();
  }, []);

  const sidebarItems = Object.keys(pageComponents).map((pageName) => ({
    icon: <LayoutDashboard size={20} />,
    label: pageName,
    path: `/dashboard/${pageName.toLowerCase()}`,
  }));

  return (
    <div className="border-r border-sortmy-gray/30 bg-sortmy-darker w-64 flex-shrink-0 p-4 h-screen">
      <div className="flex items-center mb-8 py-2">
        <Brain className="w-8 h-8 mr-2" />
        <span className="text-xl font-bold tracking-tight">SortMyAI</span>
      </div>      

      <div className="flex-1 flex flex-col space-y-1">
        {sidebarItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-4 rounded-md transition-colors
              ${isActive
                ? 'bg-sortmy-blue/20 text-sortmy-blue'
                : 'hover:bg-sortmy-gray/20 text-gray-300 hover:text-white'}
            `}
          >
              {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;