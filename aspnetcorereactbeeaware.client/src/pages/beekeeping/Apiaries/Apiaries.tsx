import React, { useState, useEffect } from 'react';
import './Apiaries.css';

interface Apiary {
    apiaryId: number;
    apiaryName: string;
    hiveCount: number;
    address: string;
    contactInfo: string;
    notes?: string;
    description?: string;
    hives?: Hive[];
}

interface Hive {
    hiveId: number;
    hiveNumber: string;
    comments?: string;
}

interface ApiaryResponse {
    apiaries: Apiary[];
    totalCount: number;
    pageCount: number;
}

interface ApiaryData {
    apiaryName: string;
    address: string;
    contactInfo: string;
    notes: string;
    description: string;
    hives: Hive[];
}

const ApiaryDetailModal: React.FC<{ apiary: Apiary | null, onClose: () => void }> = ({ apiary, onClose }) => {
    if (!apiary) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content-apiaries apiary-detail">
                <div className="apiary-detail-grid">
                    <div className="hives-section">
                        <div className="header-A">
                            <h3>Hives</h3>
                        </div>
                        <div className="header-B">
                            <h3><button className="edit-btn">Edit</button></h3>
                        </div>

                        <div className="apiary-hive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apiary.hives?.map((hive) => (
                                        <tr key={hive.hiveId}>
                                            <td>{hive.hiveId}</td>
                                            <td>{hive.hiveNumber}</td>
                                            <td>{hive.comments}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="pagination">
                                <span>{'< 1 >'}</span>
                            </div>
                        </div>

                        <div className="apiary-info">
                            <h3>{apiary.apiaryName}</h3>
                            <p><strong>Location:</strong> {apiary.address ? apiary.address : 'Not specified'}</p>
                            <p><strong>Contact Information:</strong> {apiary.contactInfo ? apiary.contactInfo : 'Not specified'}</p>
                            <p><strong>Number of Hives:</strong> {apiary.hiveCount || 0}</p>
                            <p><strong>Notes:</strong> {apiary.notes ? apiary.notes : 'No notes available'}</p>
                            <p><strong>Description:</strong> {apiary.description ? apiary.description : 'No description available'}</p>
                        </div>

                        <div className="images-section">
                            <h3>Images</h3>
                            <div className="image-placeholder">
                                <span>Image placeholder</span>
                            </div>
                            <div className="image-navigation">
                                <span>{'< 1 >'}</span>
                            </div>
                        </div>

                        <div className="map-section">
                            <h3>Location Map</h3>
                            <div className="map-placeholder">
                                <span>Map placeholder</span>
                            </div>
                        </div>

                        <div className="footer">
                            <button onClick={onClose} className="close-btn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Apiaries: React.FC = () => {
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newApiary, setNewApiary] = useState<ApiaryData>({
        apiaryName: '',
        address: '',
        contactInfo: '',
        notes: '',
        description: '',
        hives: []
    });
    const [selectedApiary, setSelectedApiary] = useState<Apiary | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingApiary, setEditingApiary] = useState<Apiary | null>(null);

    useEffect(() => {
        fetchApiaries(currentPage);
    }, [currentPage]);

    const fetchApiaries = async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/beekeeping/apiaries?page=${page}&pageSize=6`);
            if (!response.ok) {
                throw new Error('Failed to fetch apiaries');
            }
            const data: ApiaryResponse = await response.json();
            console.log('Fetched apiaries:', data.apiaries); 
            setApiaries(data.apiaries);
            setTotalPages(data.pageCount);
        } catch (err) {
            setError('An error occurred while fetching apiaries');
            console.error('Error fetching apiaries:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateApiary = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {

            const apiaryToCreate = {
                ...newApiary,
                address: newApiary.address.trim(),
                contactInfo: newApiary.contactInfo.trim(),
                notes: newApiary.notes.trim(),
                description: newApiary.description.trim()
            };

            const response = await fetch('/api/beekeeping/apiaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiaryToCreate),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to create apiary');
            }

            await fetchApiaries(currentPage);
            setShowAddModal(false);
            setNewApiary({
                apiaryName: '',
                address: '',
                contactInfo: '',
                notes: '',
                description: '',
                hives: []
            });
        } catch (err) {
            console.error('Error creating apiary:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleUpdateApiary = async (apiary: Apiary) => {
        try {
            const response = await fetch(`/api/beekeeping/apiaries/${apiary.apiaryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiary),
            });
            if (!response.ok) {
                throw new Error('Failed to update apiary');
            }
            setApiaries(prev => prev.map(a => a.apiaryId === apiary.apiaryId ? apiary : a));
            setEditingApiary(null);
        } catch (err) {
            console.error('Error updating apiary:', err);
            setError('An error occurred while updating the apiary');
        }
    };

    const handleDeleteApiary = async (apiaryId: number) => {
        if (window.confirm('Are you sure you want to delete this apiary?')) {
            try {
                const response = await fetch(`/api/beekeeping/apiaries/${apiaryId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete apiary');
                }
                setApiaries(prev => prev.filter(a => a.apiaryId !== apiaryId));
                setEditingApiary(null);
            } catch (err) {
                console.error('Error deleting apiary:', err);
                setError('An error occurred while deleting the apiary');
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (editingApiary) {
            setEditingApiary(prev => ({ ...prev!, [name]: value }));
        } else {
            setNewApiary(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddHive = () => {
        setNewApiary(prev => ({
            ...prev,
            hives: [...prev.hives, { hiveId: 0, hiveNumber: '', comments: '' }]
        }));
    };

    const handleHiveChange = (index: number, field: keyof Hive, value: string) => {
        setNewApiary(prev => {
            const newHives = [...prev.hives];
            newHives[index] = { ...newHives[index], [field]: value };
            return { ...prev, hives: newHives };
        });
    };

    const handleApiaryClick = async (apiary: Apiary) => {
        if (editMode) {
            setEditingApiary(apiary);
        } else {
            try {
                console.log('Selected apiary before fetch:', apiary);
                const hivesResponse = await fetch(`/api/beekeeping/hives/${apiary.apiaryId}`);
                if (!hivesResponse.ok) {
                    throw new Error('Failed to fetch hives');
                }
                const hives = await hivesResponse.json();
                console.log('Fetched hives:', hives);

                // Create a complete apiary object with all fields
                const completeApiary = {
                    ...apiary,
                    hives,
                    // Use null coalescing to handle empty strings as well as null/undefined
                    address: apiary.address?.trim() || '',
                    contactInfo: apiary.contactInfo?.trim() || '',
                    notes: apiary.notes?.trim() || '',
                    description: apiary.description?.trim() || '',
                    hiveCount: hives.length
                };

                console.log('Complete apiary object:', completeApiary); // Add this log
                setSelectedApiary(completeApiary);
                setShowDetailModal(true);
            } catch (err) {
                console.error('Error fetching hives:', err);
                setError('An error occurred while fetching hives');
            }
        }
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (isLoading) {
        return <div className="apiaries-container"><div className="loading">Loading...</div></div>;
    }

    if (error) {
        return <div className="apiaries-container"><div className="error">Error: {error}</div></div>;
    }

    return (
        <div className="apiaries-container">
            <div className="apiaries-header">
                <h2>List of Apiaries</h2>
                <div>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Create</button>
                    <button
                        className={`btn ${editMode ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? 'Cancel Edit' : 'Edit'}
                    </button>
                </div>
            </div>
            <table className="apiaries-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name of Apiary</th>
                        <th>Hives</th>
                    </tr>
                </thead>
                <tbody>
                    {apiaries.map((apiary) => (
                        <tr key={apiary.apiaryId} onClick={() => handleApiaryClick(apiary)} style={{ cursor: 'pointer' }}>
                            <td>{apiary.apiaryId}</td>
                            <td>{apiary.apiaryName}</td>
                            <td>{apiary.hiveCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                <span>{currentPage}</span>
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content-apiaries">
                        <form onSubmit={handleCreateApiary}>
                            <div className="from-showadd">
                                <div className="form-group-name">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="apiaryName">Name of apiary</label>
                                            <input
                                                type="text"
                                                id="apiaryName"
                                                name="apiaryName"
                                                value={newApiary.apiaryName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-notes">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="notes">Notes</label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={newApiary.notes}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                

                                <div className="form-group-descriptio">
                                    <div className="form-group">

                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={newApiary.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group-address">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="address">Location</label>  
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={newApiary.address}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group-contactInfo">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="contactInfo">Contact Information</label>  
                                            <input
                                                type="text"
                                                id="contactInfo"
                                                name="contactInfo"
                                                value={newApiary.contactInfo}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="images-section">
                                    <h3>Images</h3>
                                    <div className="image-placeholder">
                                        <img src="/path/to/placeholder/image.jpg" alt="Apiary" />
                                    </div>
                                    <div className="image-navigation">
                                        <span>{'< 1 >'}</span>
                                    </div>
                                </div>
                                <div className="map-section">
                                    <h3>Map</h3>
                                    <div className="map-placeholder">
                                        <img src="/path/to/map/image.jpg" alt="Location Map" />
                                    </div>
                                </div>


                                <div className="a"></div>

                                <div className="form-group-hive">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Hives</label>
                                            <div className="hives-container">
                                                {newApiary.hives.map((hive, index) => (
                                                    <div key={index} className="hive-input">
                                                        <input
                                                            type="text"
                                                            value={hive.hiveNumber}
                                                            onChange={(e) => handleHiveChange(index, 'hiveNumber', e.target.value)}
                                                            placeholder={`Hive ${index + 1}`}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={hive.comments || ''}
                                                            onChange={(e) => handleHiveChange(index, 'comments', e.target.value)}
                                                            placeholder="Comments"
                                                        />
                                                    </div>
                                                ))}
                                                <button type="button" onClick={handleAddHive} className="add-hive-btn">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="showAddButton">
                                    <div className="button-group">
                                        <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                                        <button type="submit">Create</button>
                                    </div>
                                </div>

                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {
                showDetailModal && (
                    <ApiaryDetailModal
                        apiary={selectedApiary}
                        onClose={() => setShowDetailModal(false)}
                    />
                )
            }

            {
                editingApiary && (
                    <div className="modal-overlay">
                        <div className="modal-content-apiaries">
                            <h2>Edit Apiary</h2>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateApiary(editingApiary);
                            }}><div className="from-edit">
                                    <div className="form-group-name">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="apiaryName">Name of apiary</label>
                                                <input
                                                    type="text"
                                                    id="apiaryName"
                                                    name="apiaryName"
                                                    value={editingApiary.apiaryName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group-notes">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="notes">Notes</label>
                                                <textarea
                                                    id="notes"
                                                    name="notes"
                                                    value={editingApiary.notes || ''}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group-descriptio">
                                        <div className="form-group">
                                            <label htmlFor="description">Description</label>
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={editingApiary.description || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group-address">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="address">Location</label>  
                                                <input
                                                    type="text"
                                                    id="address"
                                                    name="address"
                                                    value={editingApiary.address}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group-contactInfo">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="contactInfo">Contact Information</label> 
                                                <input
                                                    type="text"
                                                    id="contactInfo"
                                                    name="contactInfo"
                                                    value={editingApiary.contactInfo}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="a"></div>

                                    <div className="images-section">
                                        <h3>Images</h3>
                                        <div className="image-placeholder">
                                            <img src="/path/to/placeholder/image.jpg" alt="Apiary" />
                                        </div>
                                        <div className="image-navigation">
                                            <span>{'< 1 >'}</span>
                                        </div>
                                    </div>

                                    <div className="map-section">
                                        <h3>Map</h3>
                                        <div className="map-placeholder">
                                            <img src="/path/to/map/image.jpg" alt="Location Map" />
                                        </div>
                                    </div>




                                    <div className="showAddButton">
                                        <div className="button-group">
                                            <button type="button" onClick={() => setEditingApiary(null)}>Cancel</button>
                                            <button type="submit">Update</button>
                                            <button
                                                type="button"
                                                className="btn-danger"
                                                onClick={() => handleDeleteApiary(editingApiary.apiaryId)}
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </div>

                                </div>

                            </form>

                        </div >
                    </div >

                )
            }
        </div >
    );
};

export default Apiaries;