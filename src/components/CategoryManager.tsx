import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Category, SubCategory } from '../DataContext';
import StyledInput from './ui/StyledInput';
import ConfirmDialog from './ui/ConfirmDialog';

interface CategoryManagerProps {
    onCategorySelect?: (categoryId: string) => void;
    selectedCategoryId?: string;
}

const API_BASE = 'http://localhost:5000';

const CategoryManager: React.FC<CategoryManagerProps> = ({
    onCategorySelect,
    selectedCategoryId,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New category state
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

    // New sub-category state
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
    const [addSubCategoryError, setAddSubCategoryError] = useState<string | null>(null);

    // Edit state
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
    const [editingSubCategoryName, setEditingSubCategoryName] = useState('');

    // Delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'subcategory'; id: string; name: string } | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Fetch sub-categories for selected category
    const fetchSubCategories = async (categoryId: string) => {
        if (!categoryId) {
            setSubCategories([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/sub-categories?category_id=${categoryId}`);
            if (res.ok) {
                const data = await res.json();
                setSubCategories(data);
            }
        } catch (err) {
            console.error('Failed to load sub-categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchSubCategories(selectedCategoryId);
        } else {
            setSubCategories([]);
        }
    }, [selectedCategoryId]);

    // Create category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setAddCategoryError(null);

        try {
            const res = await fetch(`${API_BASE}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });

            if (res.status === 409) {
                setAddCategoryError('Category already exists');
                return;
            }

            if (res.ok) {
                const newCat = await res.json();
                setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
                setNewCategoryName('');
                setIsAddingCategory(false);
            }
        } catch (err) {
            setAddCategoryError('Failed to create category');
        }
    };

    // Create sub-category
    const handleCreateSubCategory = async () => {
        if (!newSubCategoryName.trim() || !selectedCategoryId) return;
        setAddSubCategoryError(null);

        try {
            const res = await fetch(`${API_BASE}/api/sub-categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_id: selectedCategoryId, name: newSubCategoryName.trim() }),
            });

            if (res.status === 409) {
                setAddSubCategoryError('Sub-category already exists');
                return;
            }

            if (res.ok) {
                const newSubCat = await res.json();
                setSubCategories(prev => [...prev, newSubCat].sort((a, b) => a.name.localeCompare(b.name)));
                setNewSubCategoryName('');
                setIsAddingSubCategory(false);
            }
        } catch (err) {
            setAddSubCategoryError('Failed to create sub-category');
        }
    };

    // Rename category
    const handleRenameCategory = async (id: string) => {
        if (!editingCategoryName.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingCategoryName.trim() }),
            });

            if (res.status === 409) {
                setError('Category name already exists');
                return;
            }

            if (res.ok) {
                const updated = await res.json();
                setCategories(prev => prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
                setEditingCategoryId(null);
                setEditingCategoryName('');
            }
        } catch (err) {
            setError('Failed to rename category');
        }
    };

    // Rename sub-category
    const handleRenameSubCategory = async (id: string) => {
        if (!editingSubCategoryName.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/api/sub-categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingSubCategoryName.trim() }),
            });

            if (res.status === 409) {
                setError('Sub-category name already exists');
                return;
            }

            if (res.ok) {
                const updated = await res.json();
                setSubCategories(prev => prev.map(s => s.id === id ? updated : s).sort((a, b) => a.name.localeCompare(b.name)));
                setEditingSubCategoryId(null);
                setEditingSubCategoryName('');
            }
        } catch (err) {
            setError('Failed to rename sub-category');
        }
    };

    // Delete handler
    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        setDeleteError(null);

        const endpoint = itemToDelete.type === 'category'
            ? `${API_BASE}/api/categories/${itemToDelete.id}`
            : `${API_BASE}/api/sub-categories/${itemToDelete.id}`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            const data = await res.json();

            if (res.status === 409) {
                setDeleteError(data.error || 'Cannot delete: has dependencies');
                return;
            }

            if (res.ok) {
                if (itemToDelete.type === 'category') {
                    setCategories(prev => prev.filter(c => c.id !== itemToDelete.id));
                    if (selectedCategoryId === itemToDelete.id) {
                        onCategorySelect?.('');
                    }
                } else {
                    setSubCategories(prev => prev.filter(s => s.id !== itemToDelete.id));
                }
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            }
        } catch (err) {
            setDeleteError('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteDialog = (type: 'category' | 'subcategory', id: string, name: string) => {
        setItemToDelete({ type, id, name });
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Error message */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-[8px] text-[13px] text-red-600">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">×</button>
                </div>
            )}

            {/* Categories Section */}
            <div className="bg-white border border-black/8 rounded-[12px] overflow-hidden">
                <div className="px-5 py-4 bg-[#FAFAFA] border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-black">Categories</h3>
                    <button
                        onClick={() => { setIsAddingCategory(true); setAddCategoryError(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-black bg-white border border-black/12 rounded-[6px] hover:bg-[#F5F5F5] transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>

                <div className="divide-y divide-black/5">
                    {/* Add new category input */}
                    {isAddingCategory && (
                        <div className="px-5 py-3 bg-blue-50/50">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category name..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                                    className="flex-1 px-3 py-2 text-[13px] border border-black/12 rounded-[6px] outline-none focus:border-black/30"
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-[6px]"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setAddCategoryError(null); }}
                                    className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-[6px]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {addCategoryError && (
                                <p className="mt-1 text-[12px] text-red-500">{addCategoryError}</p>
                            )}
                        </div>
                    )}

                    {categories.length === 0 && !isAddingCategory && (
                        <div className="px-5 py-8 text-center text-[13px] text-zinc-400">
                            No categories yet. Click "Add" to create one.
                        </div>
                    )}

                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            onClick={() => onCategorySelect?.(cat.id)}
                            className={`
                px-5 py-3 flex items-center justify-between cursor-pointer transition-colors
                ${selectedCategoryId === cat.id ? 'bg-black/5' : 'hover:bg-[#FAFAFA]'}
              `}
                        >
                            {editingCategoryId === cat.id ? (
                                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        value={editingCategoryName}
                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory(cat.id)}
                                        className="flex-1 px-3 py-1.5 text-[13px] border border-black/12 rounded-[6px] outline-none focus:border-black/30"
                                    />
                                    <button onClick={() => handleRenameCategory(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[14px] text-black">{cat.name}</span>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}
                                            className="p-1.5 text-zinc-400 hover:text-black hover:bg-black/5 rounded-[4px] transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteDialog('category', cat.id, cat.name)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-[4px] transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-Categories Section */}
            <div className="bg-white border border-black/8 rounded-[12px] overflow-hidden">
                <div className="px-5 py-4 bg-[#FAFAFA] border-b border-black/5 flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-black">
                        Sub-Categories
                        {selectedCategoryId && (
                            <span className="ml-2 text-[12px] font-normal text-zinc-500">
                                for {categories.find(c => c.id === selectedCategoryId)?.name}
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={() => { setIsAddingSubCategory(true); setAddSubCategoryError(null); }}
                        disabled={!selectedCategoryId}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-black bg-white border border-black/12 rounded-[6px] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </button>
                </div>

                <div className="divide-y divide-black/5">
                    {/* Add new sub-category input */}
                    {isAddingSubCategory && selectedCategoryId && (
                        <div className="px-5 py-3 bg-blue-50/50">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newSubCategoryName}
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                    placeholder="Sub-category name..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSubCategory()}
                                    className="flex-1 px-3 py-2 text-[13px] border border-black/12 rounded-[6px] outline-none focus:border-black/30"
                                />
                                <button onClick={handleCreateSubCategory} className="p-2 text-green-600 hover:bg-green-50 rounded-[6px]">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setIsAddingSubCategory(false); setNewSubCategoryName(''); setAddSubCategoryError(null); }} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-[6px]">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {addSubCategoryError && (
                                <p className="mt-1 text-[12px] text-red-500">{addSubCategoryError}</p>
                            )}
                        </div>
                    )}

                    {!selectedCategoryId && (
                        <div className="px-5 py-8 text-center text-[13px] text-zinc-400">
                            Select a category to view its sub-categories
                        </div>
                    )}

                    {selectedCategoryId && subCategories.length === 0 && !isAddingSubCategory && (
                        <div className="px-5 py-8 text-center text-[13px] text-zinc-400">
                            No sub-categories. Click "Add" to create one.
                        </div>
                    )}

                    {subCategories.map(sub => (
                        <div key={sub.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#FAFAFA] transition-colors">
                            {editingSubCategoryId === sub.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editingSubCategoryName}
                                        onChange={(e) => setEditingSubCategoryName(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubCategory(sub.id)}
                                        className="flex-1 px-3 py-1.5 text-[13px] border border-black/12 rounded-[6px] outline-none focus:border-black/30"
                                    />
                                    <button onClick={() => handleRenameSubCategory(sub.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setEditingSubCategoryId(null); setEditingSubCategoryName(''); }} className="p-1.5 text-zinc-400 hover:bg-zinc-100 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-[14px] text-black">{sub.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setEditingSubCategoryId(sub.id); setEditingSubCategoryName(sub.name); }}
                                            className="p-1.5 text-zinc-400 hover:text-black hover:bg-black/5 rounded-[4px] transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteDialog('subcategory', sub.id, sub.name)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-[4px] transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setItemToDelete(null); setDeleteError(null); }}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${itemToDelete?.type === 'category' ? 'Category' : 'Sub-Category'}`}
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isDeleting}
                error={deleteError || undefined}
            />
        </div>
    );
};

export default CategoryManager;
