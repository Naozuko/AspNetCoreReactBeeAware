import React, { useState, useEffect, ChangeEvent } from 'react';
import './Hives.css';

interface Apiary {
    apiaryId: number;
    apiaryName: string;
}

interface Hive {
    hiveId: number;
    hiveNumber: string;
    apiaryId: number;
    queenExcluder: boolean;
    frameCount: number;
    beetleTrap: boolean;
    comments: string | null;
}

const Hives: React.FC = () => {
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = useState<number | null>(null);
    const [hives, setHives] = useState<Hive[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalHives, setTotalHives] = useState(0);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [newHive, setNewHive] = useState<Partial<Hive>>({});
    const [modifiedHive, setModifiedHive] = useState<Hive | null>(null);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hivesPerPage = 9;

    useEffect(() => {
        fetchApiaries();
    }, []);

    useEffect(() => {
        if (selectedApiaryId) {
            fetchHives(currentPage);
            fetchHiveCount();
        }
    }, [selectedApiaryId, currentPage]);

    const fetchApiaries = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/beekeeping/apiaries');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApiaries(data.apiaries);
            if (data.apiaries.length > 0) {
                setSelectedApiaryId(data.apiaries[0].apiaryId);
            }
        } catch (error) {
            console.error('Error fetching apiaries:', error);
            setError('Failed to fetch apiaries');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHives = async (page: number) => {
        if (!selectedApiaryId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/beekeeping/hives/${selectedApiaryId}?start=${(page - 1) * hivesPerPage}&count=${hivesPerPage}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHives(data);
        } catch (error) {
            console.error('Error fetching hives:', error);
            setError('Failed to fetch hives');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHiveCount = async () => {
        if (!selectedApiaryId) return;
        try {
            const response = await fetch(`/api/beekeeping/hives/count/${selectedApiaryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const count = await response.json();
            setTotalHives(count);
        } catch (error) {
            console.error('Error fetching hive count:', error);
        }
    };

    const handleHiveClick = (hive: Hive) => {
        setSelectedHive(hive);
        setModifiedHive(hive);
    };

    const handleAddNewHive = () => {
        setShowAddModal(true);
        setNewHive({
            apiaryId: selectedApiaryId || 0,
            queenExcluder: false,
            beetleTrap: false,
            comments: ''
        });
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setNewHive({});
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = event.target;
        const updatedValue = type === 'radio' ? value === 'true' :
            type === 'number' ? Number(value) : value;

        if (showAddModal) {
            setNewHive(prev => ({ ...prev, [name]: updatedValue }));
        } else if (showModifyModal || editingField) {
            setModifiedHive(prev => prev ? { ...prev, [name]: updatedValue } : null);
        }
    };

    const handleSubmitNewHive = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/beekeeping/hives', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newHive),
            });
            if (response.ok) {
                const addedHive = await response.json();
                console.log('New hive added:', addedHive);
                handleCloseAddModal();
                fetchHives(currentPage);
                fetchHiveCount();
            } else {
                const errorData = await response.json();
                console.error('Failed to add new hive:', errorData);
            }
        } catch (error) {
            console.error('Error adding new hive:', error);
        }
    };

    const handleModifyHive = () => {
        if (selectedHive) {
            setModifiedHive(selectedHive);
            setShowModifyModal(true);
        }
    };

    const handleCloseModifyModal = () => {
        setShowModifyModal(false);
        setModifiedHive(null);
    };

    const handleSubmitModifiedHive = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!modifiedHive) return;

        try {
            const response = await fetch(`/api/beekeeping/hives/${modifiedHive.hiveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modifiedHive),
            });
            if (response.ok) {
                console.log('Hive modified successfully');
                handleCloseModifyModal();
                fetchHives(currentPage);
                setSelectedHive(modifiedHive);
            } else {
                const errorData = await response.json();
                console.error('Failed to modify hive:', errorData);
            }
        } catch (error) {
            console.error('Error modifying hive:', error);
        }
    };

    const handleEditField = (field: string) => {
        setEditingField(field);
        setModifiedHive(selectedHive);
    };

    const handleSaveField = async () => {
        if (!modifiedHive || !editingField) return;

        try {
            const response = await fetch(`/api/beekeeping/hives/${modifiedHive.hiveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modifiedHive),
            });
            if (response.ok) {
                console.log(`Field ${editingField} updated successfully`);

                setSelectedHive(prevHive => ({
                    ...prevHive!,
                    [editingField]: modifiedHive[editingField as keyof Hive]
                }));

                setHives(prevHives => prevHives.map(hive =>
                    hive.hiveId === modifiedHive.hiveId ? { ...hive, [editingField]: modifiedHive[editingField as keyof Hive] } : hive
                ));

                setEditingField(null);
            } else {
                const errorData = await response.json();
                console.error('Failed to update field:', errorData);
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    };

    const handleDeleteHive = async () => {
        if (!modifiedHive) return;

        try {
            const response = await fetch(`/api/beekeeping/hives/${modifiedHive.hiveId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Hive deleted successfully');
                handleCloseModifyModal();
                fetchHives(currentPage);
                fetchHiveCount();
                setSelectedHive(null);
                setShowDeleteConfirmation(false);
            } else {
                console.error('Failed to delete hive:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting hive:', error);
        }
    };

    return (
        <div className="hives-container">
            {isLoading && <div className="loading">Loading...</div>}
            {error && <div className="error">Error: {error}</div>}
            {!isLoading && !error && (
                <>
                    <div className="grid-item">
                        <h4>Select Apiary</h4>
                        <select
                            className="form-control"
                            onChange={(e) => setSelectedApiaryId(Number(e.target.value))}
                            value={selectedApiaryId || ''}
                        >
                            <option value="">Select an apiary</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.apiaryId} value={apiary.apiaryId}>
                                    {apiary.apiaryName}
                                </option>
                            ))}
                        </select>
                        <h4>List of Hives</h4>
                        <div id="hiveContainer">
                            {hives.map((hive) => (
                                <button
                                    key={hive.hiveId}
                                    className={`hive-button ${selectedHive?.hiveId === hive.hiveId ? 'selected' : ''}`}
                                    onClick={() => handleHiveClick(hive)}
                                >
                                    {hive.hiveNumber}
                                </button>
                            ))}
                        </div>
                        <div className="hive-navigation">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage * hivesPerPage >= totalHives}
                            >
                                Next
                            </button>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <button id="modifyHive" className="btn btn-success" onClick={handleModifyHive} disabled={!selectedHive}>MODIFY</button>
                            <button id="addNewHive" className="btn btn-success" style={{ float: 'right' }} onClick={handleAddNewHive}>ADD NEW</button>
                        </div>
                    </div>

                    <div className="grid-item map-container">
                        <h4>Three Bee Apiaries</h4>
                        <p>Map placeholder - Apiary locations would be shown here</p>
                    </div>

                    <div className="grid-item">
                        <h4>Number of Frames <button className="edit-button" onClick={() => handleEditField('frameCount')}>EDIT</button></h4>
                        {editingField === 'frameCount' ? (
                            <div>
                                <select
                                    name="frameCount"
                                    value={modifiedHive?.frameCount || ''}
                                    onChange={handleInputChange}
                                >
                                    {[5, 6, 7, 8, 9, 10].map(count => (
                                        <option key={count} value={count}>{count}</option>
                                    ))}
                                </select>
                                <button onClick={handleSaveField}>Save</button>
                            </div>
                        ) : (
                            <p id="frameCount">{selectedHive ? selectedHive.frameCount : 'Select a hive'}</p>
                        )}
                    </div>

                    <div className="grid-item">
                        <h4>Queen Excluder <button className="edit-button" onClick={() => handleEditField('queenExcluder')}>EDIT</button></h4>
                        {editingField === 'queenExcluder' ? (
                            <div>
                                <select
                                    name="queenExcluder"
                                    value={modifiedHive?.queenExcluder.toString() || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                                <button onClick={handleSaveField}>Save</button>
                            </div>
                        ) : (
                            <p id="queenExcluder">{selectedHive ? (selectedHive.queenExcluder ? 'Yes' : 'No') : 'Select a hive'}</p>
                        )}
                    </div>

                    <div className="grid-item">
                        <h4>Beetle Trap <button className="edit-button" onClick={() => handleEditField('beetleTrap')}>EDIT</button></h4>
                        {editingField === 'beetleTrap' ? (
                            <div>
                                <select
                                    name="beetleTrap"
                                    value={modifiedHive?.beetleTrap.toString() || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                                <button onClick={handleSaveField}>Save</button>
                            </div>
                        ) : (
                            <p id="beetleTrap">{selectedHive ? (selectedHive.beetleTrap ? 'Yes' : 'No') : 'Select a hive'}</p>
                        )}
                    </div>

                    <div className="grid-item">
                        <h4>Comments <button className="edit-button" onClick={() => handleEditField('comments')}>EDIT</button></h4>
                        {editingField === 'comments' ? (
                            <div>
                                <textarea
                                    name="comments"
                                    value={modifiedHive?.comments || ''}
                                    onChange={handleInputChange}
                                />
                                <button onClick={handleSaveField}>Save</button>
                            </div>
                        ) : (
                            <p id="comments">{selectedHive ? (selectedHive.comments || 'No comments') : 'Select a hive'}</p>
                        )}
                    </div>

                    {showAddModal && (
                        <div className="modal">
                            <div className="modal-content">
                                <form className="hive-form" onSubmit={handleSubmitNewHive}>
                                    <h2>HIVE CONFIGURATION</h2>
                                    <label htmlFor="hiveNumber">Your Hive</label>
                                    <input
                                        type="text"
                                        id="hiveNumber"
                                        name="hiveNumber"
                                        placeholder="Enter your hive name or number"
                                        value={newHive.hiveNumber || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <label htmlFor="frameCount">Frames</label>
                                    <select
                                        id="frameCount"
                                        name="frameCount"
                                        value={newHive.frameCount || ''}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select hive frame quantity</option>
                                        {[5, 6, 7, 8, 9, 10].map(count => (
                                            <option key={count} value={count}>{count}</option>
                                        ))}
                                    </select>
                                    <div className="radio-group-container">
                                        <div className="radio-group">
                                            <label>Queen Excluders</label>
                                            <div className="radio-options">
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="queenExcluderYes"
                                                        name="queenExcluder"
                                                        value="true"
                                                        checked={newHive.queenExcluder === true}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label htmlFor="queenExcluderYes">Yes</label>
                                                </div>
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="queenExcluderNo"
                                                        name="queenExcluder"
                                                        value="false"
                                                        checked={newHive.queenExcluder === false}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label htmlFor="queenExcluderNo">No</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="radio-group">
                                            <label>Beetle Trap</label>
                                            <div className="radio-options">
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="beetleTrapYes"
                                                        name="beetleTrap"
                                                        value="true"
                                                        checked={newHive.beetleTrap === true}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label htmlFor="beetleTrapYes">Yes</label>
                                                </div>
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="beetleTrapNo"
                                                        name="beetleTrap"
                                                        value="false"
                                                        checked={newHive.beetleTrap === false}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label htmlFor="beetleTrapNo">No</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <label htmlFor="comments">Comment</label>
                                    <textarea
                                        id="comments"
                                        name="comments"
                                        placeholder="Enter a comment about your hive"
                                        value={newHive.comments || ''}
                                        onChange={handleInputChange}
                                    />
                                    <div className="button-group">
                                        <button type="button" className="cancel-btn" onClick={handleCloseAddModal}>CANCEL</button>
                                        <button type="submit" className="submit-btn">SUBMIT</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showModifyModal && modifiedHive && (
                        <div className="modal">
                            <div className="modal-content">
                                <form className="hive-form" onSubmit={handleSubmitModifiedHive}>
                                    <h2>MODIFY HIVE</h2>
                                    <label htmlFor="hiveNumber">Hive Number</label>
                                    <input
                                        type="text"
                                        id="hiveNumber"
                                        name="hiveNumber"
                                        value={modifiedHive.hiveNumber}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <label htmlFor="frameCount">Frames</label>
                                    <select
                                        id="frameCount"
                                        name="frameCount"
                                        value={modifiedHive.frameCount}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {[5, 6, 7, 8, 9, 10].map(count => (
                                            <option key={count} value={count}>{count}</option>
                                        ))}
                                    </select>
                                    <div className="radio-group-container">
                                        <div className="radio-group">
                                            <label>Queen Excluders</label>
                                            <div className="radio-options">
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="modifyQueenExcluderYes"
                                                        name="queenExcluder"
                                                        value="true"
                                                        checked={modifiedHive.queenExcluder === true}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label htmlFor="modifyQueenExcluderYes">Yes</label>
                                                </div>
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="modifyQueenExcluderNo"
                                                        name="queenExcluder"
                                                        value="false"
                                                        checked={modifiedHive.queenExcluder === false}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label htmlFor="modifyQueenExcluderNo">No</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="radio-group">
                                            <label>Beetle Trap</label>
                                            <div className="radio-options">
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="modifyBeetleTrapYes"
                                                        name="beetleTrap"
                                                        value="true"
                                                        checked={modifiedHive.beetleTrap === true}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <label htmlFor="modifyBeetleTrapYes">Yes</label>
                                                </div>
                                                <div className="radio-option">
                                                    <input
                                                        type="radio"
                                                        id="modifyBeetleTrapNo"
                                                        name="beetleTrap"
                                                        value="false"
                                                        checked={modifiedHive.beetleTrap === false}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label htmlFor="modifyBeetleTrapNo">No</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <label htmlFor="modifyComments">Comment</label>
                                    <textarea
                                        id="modifyComments"
                                        name="comments"
                                        placeholder="Enter a comment about your hive"
                                        value={modifiedHive.comments || ''}
                                        onChange={handleInputChange}
                                    />
                                    <div className="button-group modify-buttons">
                                        <button type="button" className="delete-btn" onClick={() => setShowDeleteConfirmation(true)}>DELETE</button>
                                        <div className="right-buttons">
                                            <button type="button" className="cancel-btn" onClick={handleCloseModifyModal}>CANCEL</button>
                                            <button type="submit" className="submit-btn">SUBMIT</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showDeleteConfirmation && (
                        <div className="modal">
                            <div className="modal-content">
                                <h2>Confirm Delete</h2>
                                <p>Are you sure you want to delete this hive?</p>
                                <div className="delete-confirmation-buttons">
                                    <button type="button" className="cancel-btn" onClick={() => setShowDeleteConfirmation(false)}>CANCEL</button>
                                    <button type="button" className="confirm-delete-btn" onClick={handleDeleteHive}>CONFIRM DELETE</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Hives;

