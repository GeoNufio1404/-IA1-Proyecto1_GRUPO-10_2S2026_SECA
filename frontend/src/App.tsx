import { useState } from 'react'
import { Layout, type ViewName } from './components/Layout'
import type { CaseItem, SuspectItem } from './types'
import { HomePage } from './pages/HomePage'
import { CasePage } from './pages/CasePage'
import { SuspectsPage } from './pages/SuspectsPage'
import { AnalysisPage } from './pages/AnalysisPage'
import { ResultPage } from './pages/ResultPage'
import { AdminPage } from './pages/AdminPage'
import { SystemPage } from './pages/SystemPage'

export default function App(){
 const[view,setView]=useState<ViewName>('inicio');const[currentCase,setCurrentCase]=useState<CaseItem|null>(null);const[selected,setSelected]=useState<SuspectItem|null>(null)
 const openCase=(c:CaseItem)=>{setCurrentCase(c);setSelected(null);setView('caso')}
 const openSuspect=(s:SuspectItem)=>{setSelected(s);setView('sospechosos')}
 let content=null
 switch(view){case'inicio':content=<HomePage onOpenCase={openCase} onAdmin={()=>setView('admin')}/>;break;case'caso':content=<CasePage currentCase={currentCase} onSelectSuspect={openSuspect} onGoAnalysis={()=>setView('analisis')}/>;break;case'sospechosos':content=<SuspectsPage currentCase={currentCase} selected={selected} onSelect={setSelected}/>;break;case'analisis':content=<AnalysisPage currentCase={currentCase}/>;break;case'resultado':content=<ResultPage currentCase={currentCase}/>;break;case'admin':content=<AdminPage currentCase={currentCase} onCaseCreated={c=>{setCurrentCase(c)}}/>;break;case'sistema':content=<SystemPage/>}
 return <Layout view={view} onNavigate={setView} caseTitle={currentCase?.Titulo}>{content}</Layout>
}
