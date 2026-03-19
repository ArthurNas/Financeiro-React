import { useEffect, useState } from 'react';
import despesaService from '../../service/despesaService';
import proventoService from '../../service/proventoService';
import { Plus, Trash2, Wallet, Search, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/confirmModal';

function Home() {
    

  return (
    <div className="min-h-screen bg-gray-100 p-5 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                  HOME
                </h1>
              </div>
            </div>

          </div>

          
        </header>

        
      </div>
    </div>
  )
}

export default Home