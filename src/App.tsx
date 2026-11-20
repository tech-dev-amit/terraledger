import { useEffect, useState } from 'react';
import { StoreContext } from '@/lib/store';
import { useStoreData } from '@/lib/useStoreData';
import { Sidebar, TopHeader } from '@/components/Shell';
import { Dashboard } from '@/pages/Dashboard';
import { Inventory } from '@/pages/Inventory';
import { LeadsPage } from '@/pages/Leads';
import { BookingsPage } from '@/pages/Bookings';
import { PartnerPortal } from '@/pages/PartnerPortal';
import { BuyerPortal } from '@/pages/BuyerPortal';
import { AddProject } from '@/pages/AddProject';
import { ProjectCatalogue } from '@/pages/ProjectCatalogue';

export default function App() {
  const store = useStoreData();
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [catalogueProjectId, setCatalogueProjectId] = useState<string | null>(null);

  // Handle URL shortcut / PWA start_url param / shared catalogue links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    const idParam = params.get('id');

    if (pageParam === 'project-view' && idParam) {
      setCatalogueProjectId(idParam);
      setPage('project-view');
    } else if (
      pageParam &&
      ['dashboard', 'inventory', 'add-project', 'leads', 'bookings', 'cp', 'buyer'].includes(pageParam)
    ) {
      setPage(pageParam);
    }
  }, []);

  useEffect(() => {
    if (store.role === 'cp') setPage('cp');
    else if (store.role === 'buyer') setPage('buyer');
    else if (page === 'cp' || page === 'buyer') setPage('dashboard');
  }, [store.role]);

  const handleNavigate = (targetPage: string, projId?: string) => {
    if (projId) {
      setCatalogueProjectId(projId);
    }
    setPage(targetPage);
  };

  // If viewing standalone customer link without login context
  const isPublicCatalogue = page === 'project-view';

  return (
    <StoreContext.Provider value={store}>
      <div className="flex min-h-screen bg-canvas-gradient text-slate-900 font-sans">
        {/* Fixed Sidebar */}
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

        {/* Main Content Area Offset for Fixed Sidebar */}
        <div
          className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out ${
            collapsed ? 'ml-[72px]' : 'ml-64'
          }`}
        >
          <TopHeader />
          <main className="flex-1 overflow-y-auto px-6 py-7 lg:px-8 animate-fade-up">
            {store.loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 shadow-glow-indigo" />
                  <div className="absolute h-6 w-6 rounded-full bg-indigo-50" />
                </div>
              </div>
            ) : (
              <>
                {page === 'dashboard' && <Dashboard />}
                {page === 'inventory' && <Inventory onNavigate={handleNavigate} />}
                {page === 'add-project' && (
                  <AddProject
                    onProjectCreated={(id) => {
                      setCatalogueProjectId(id);
                      setPage('project-view');
                    }}
                  />
                )}
                {page === 'project-view' && (
                  <ProjectCatalogue
                    projectId={catalogueProjectId || store.projects[0]?.id || ''}
                    onBack={() => setPage('inventory')}
                  />
                )}
                {page === 'leads' && <LeadsPage />}
                {page === 'bookings' && <BookingsPage />}
                {page === 'cp' && <PartnerPortal />}
                {page === 'buyer' && <BuyerPortal />}
              </>
            )}
          </main>
        </div>
      </div>
    </StoreContext.Provider>
  );
}
