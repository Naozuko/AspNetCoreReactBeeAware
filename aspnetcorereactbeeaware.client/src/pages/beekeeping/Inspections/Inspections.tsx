import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Inspections.css';

interface Apiary {
    apiaryId: number;
    apiaryName: string;
}

interface Hive {
    hiveId: number;
    hiveNumber: string;
    apiaryId: number;
}

interface Inspection {
    inspectionId: number;
    hiveId: number;
    inspectionDate: string;
    broodFrames: number;
    broodPattern: string;
    honeyFrames: number;
    honeyPattern: string;
    eggFrames: number;
    eggPattern: string;
    emptyFrames: number;
    temperament: string;
    comments: string;
    nextInspectionDate: string;
}

interface Disease {
    diseaseId: number;
    inspectionId: number;
    diseaseName: string;
    severity: string;
    description: string;
    imageUrl: string;
}

const Inspections: React.FC = () => {
    const [apiaries, setApiaries] = useState<Apiary[]>([]);
    const [selectedApiaryId, setSelectedApiaryId] = useState<number | null>(null);
    const [hives, setHives] = useState<Hive[]>([]);
    const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [totalHives, setTotalHives] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hivesPerPage = 9;

    // New state for modals
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [showDiseasesModal, setShowDiseasesModal] = useState(false);
    const [newInspection, setNewInspection] = useState<Partial<Inspection>>({});
    const [newDiseases, setNewDiseases] = useState<Partial<Disease>[]>([{}]);
    const [lastAddedInspectionId, setLastAddedInspectionId] = useState<number | null>(null);

    useEffect(() => {
        fetchApiaries();
    }, []);

    useEffect(() => {
        if (selectedApiaryId) {
            fetchHives(currentPage);
            fetchHiveCount();
        }
    }, [selectedApiaryId, currentPage]);

    useEffect(() => {
        if (selectedHive) {
            fetchInspections(selectedHive.hiveId, selectedDate);
        }
    }, [selectedHive, selectedDate]);

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

    const fetchInspections = async (hiveId: number, date: Date) => {
        try {
            const response = await fetch(`/api/beekeeping/inspections/${hiveId}?date=${date.toISOString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setInspections(data);
            if (data.length > 0) {
                fetchDiseases(data[0].inspectionId);
            }
        } catch (error) {
            console.error('Error fetching inspections:', error);
        }
    };

    const fetchDiseases = async (inspectionId: number) => {
        try {
            const response = await fetch(`/api/beekeeping/diseases/${inspectionId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDiseases(data);
        } catch (error) {
            console.error('Error fetching diseases:', error);
        }
    };

    const handleHiveClick = (hive: Hive) => {
        setSelectedHive(hive);
    };

    const handleApiaryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newApiaryId = Number(event.target.value);
        setSelectedApiaryId(newApiaryId);
        setCurrentPage(1);
        setSelectedHive(null);
    };

    const handleDateChange = (date: Date | Date[]) => {
        if (date instanceof Date) {
            setSelectedDate(date);
            if (selectedHive) {
                fetchInspections(selectedHive.hiveId, date);
            }
        }
    };

    const handleInspectionClick = () => {
        if (selectedHive) {
            setShowInspectionModal(true);
            setNewInspection({
                hiveId: selectedHive.hiveId,
                inspectionDate: new Date().toISOString().split('T')[0],
                nextInspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
    };

    const handleCloseInspectionModal = () => {
        setShowInspectionModal(false);
        setNewInspection({});
    };

    const handleInspectionInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewInspection(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitInspection = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/beekeeping/inspections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newInspection),
            });
            if (response.ok) {
                const addedInspection = await response.json();
                console.log('New inspection added:', addedInspection);
                setLastAddedInspectionId(addedInspection.inspectionId);
                setShowInspectionModal(false);
                setShowDiseasesModal(true);
                if (selectedHive) {
                    fetchInspections(selectedHive.hiveId, selectedDate);
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to add new inspection:', errorData);
            }
        } catch (error) {
            console.error('Error adding new inspection:', error);
        }
    };

    const handleCloseDiseasesModal = () => {
        setShowDiseasesModal(false);
        setNewDiseases([{}]);
    };

    const handleDiseaseInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewDiseases(prev => prev.map((disease, i) => i === index ? { ...disease, [name]: value } : disease));
    };

    const handleAddDisease = () => {
        setNewDiseases(prev => [...prev, {}]);
    };

    const handleRemoveDisease = (index: number) => {
        setNewDiseases(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitDiseases = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!lastAddedInspectionId) {
            console.error('No inspection ID available for disease submission');
            return;
        }
        try {
            for (const disease of newDiseases) {
                if (!disease.diseaseName) continue; // Skip empty disease entries

                const diseaseToSubmit = {
                    ...disease,
                    inspectionId: lastAddedInspectionId
                };
                console.log('Submitting disease:', diseaseToSubmit);

                const response = await fetch('/api/beekeeping/diseases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(diseaseToSubmit),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to add new disease. Status:', response.status, 'Error:', errorText);
                    return;
                }

                const responseData = await response.json();
                console.log('Disease added successfully:', responseData);
            }

            console.log('All diseases added successfully');
            setShowDiseasesModal(false);
            if (selectedHive) {
                fetchInspections(selectedHive.hiveId, selectedDate);
            }
        } catch (error) {
            console.error('Error adding new diseases:', error);
        }
    };

    if (isLoading) {
        return <div className="inspections-container"><div className="loading">Loading...</div></div>;
    }

    if (error) {
        return <div className="inspections-container"><div className="error">Error: {error}</div></div>;
    }

    return (
        <div className="inspections-container">
            <div className="grid-item">
                <h4>Select Apiary</h4>
                <select
                    className="form-control"
                    onChange={handleApiaryChange}
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
            </div>

            <div className="grid-item map-container">
                <h4>Three Bee Apiaries</h4>
                <p>Map placeholder - Apiary locations would be shown here</p>
            </div>

            <div className="grid-item calendar-container">
                <div className="inspection-data">
                    <h4>Select Date & Time</h4>
                    <Calendar
                        onChange={handleDateChange}
                        value={selectedDate}
                    />
                    <button className="inspection-button" onClick={handleInspectionClick}>INSPECTION</button>
                </div>
            </div>

            <div className="grid-item inspection-details">
                <h4>{selectedHive ? `${selectedHive.hiveNumber} Inspection Summary` : 'Select a hive'}</h4>
                {selectedHive && inspections.length > 0 && (
                    <div>
                        <p>Last Inspection: {new Date(inspections[0].inspectionDate).toLocaleDateString()}</p>
                        <p>Next Inspection: {new Date(inspections[0].nextInspectionDate).toLocaleDateString()}</p>
                        <p>Brood: {inspections[0].broodFrames} {inspections[0].broodPattern} Frames</p>
                        <p>Honey: {inspections[0].honeyFrames} {inspections[0].honeyPattern} Frames</p>
                        <p>Eggs: {inspections[0].eggFrames} {inspections[0].eggPattern} Frames</p>
                        <p>Empty: {inspections[0].emptyFrames} Frames</p>
                        <p>Temperament: {inspections[0].temperament}</p>
                        <p>Comments: {inspections[0].comments}</p>
                    </div>
                )}
                <h4>{selectedHive ? `${selectedHive.hiveNumber} Diseases` : ''}</h4>
                {selectedHive && diseases.map((disease, index) => (
                    <div key={disease.diseaseId}>
                        <p>Disease {index + 1}: {disease.diseaseName}</p>
                        <p>Severity: {disease.severity}</p>
                        <div className="disease-image-placeholder">
                            {disease.imageUrl ? <img src={disease.imageUrl} alt={disease.diseaseName} /> : <p>&lt;IMAGE&gt;</p>}
                        </div>
                        <p>Comment: {disease.description}</p>
                    </div>
                ))}
            </div>

            {showInspectionModal && (
                <div className="modal">
                    <div className="modal-content-inspect">
                        <div className="from-showInspect">
                            <div className="header">
                                <h2>HIVE #{selectedHive?.hiveNumber} INSPECTION</h2>
                            </div>
                        </div>
                        <form onSubmit={handleSubmitInspection}>
                            <div className="from-showInspect">
                                <div className="form-group-broodFrames">
                                    <div className="form-group">
                                        <label htmlFor="broodFrames">Brood Frames</label>
                                        <select
                                            id="broodFrames"
                                            name="broodFrames"
                                            value={newInspection.broodFrames || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select brood frame quantity</option>
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>


                                <div className="form-group-broodPattern">
                                    <div className="form-group">
                                        <label htmlFor="broodPattern">Brood Pattern</label>
                                        <select
                                            id="broodPattern"
                                            name="broodPattern"
                                            value={newInspection.broodPattern || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select brood pattern</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-honeyFrames">
                                    <div className="form-group">
                                        <label htmlFor="honeyFrames">Honey Frames</label>
                                        <select
                                            id="honeyFrames"
                                            name="honeyFrames"
                                            value={newInspection.honeyFrames || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select honey frame quantity</option>
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-honeyPattern">
                                    <div className="form-group">
                                        <label htmlFor="honeyPattern">Honey Pattern</label>
                                        <select
                                            id="honeyPattern"
                                            name="honeyPattern"
                                            value={newInspection.honeyPattern || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select honey pattern</option>
                                            <option value="Full">Full</option>
                                            <option value="Partial">Partial</option>
                                            <option value="Empty">Empty</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-eggFrame">
                                    <div className="form-group">
                                        <label htmlFor="eggFrames">Egg Frames</label>
                                        <select
                                            id="eggFrames"
                                            name="eggFrames"
                                            value={newInspection.eggFrames || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select egg frame quantity</option>
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-eggPattern">
                                    <div className="form-group">
                                        <label htmlFor="eggPattern">Egg Pattern</label>
                                        <select
                                            id="eggPattern"
                                            name="eggPattern"
                                            value={newInspection.eggPattern || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select egg pattern</option>
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-emptyFrames">
                                    <div className="form-group">
                                        <label htmlFor="emptyFrames">Empty Frames</label>
                                        <select
                                            id="emptyFrames"
                                            name="emptyFrames"
                                            value={newInspection.emptyFrames || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select empty frame quantity</option>
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-temperament">
                                    <div className="form-group">
                                        <label htmlFor="temperament">Temperament</label>
                                        <select
                                            id="temperament"
                                            name="temperament"
                                            value={newInspection.temperament || ''}
                                            onChange={handleInspectionInputChange}
                                            required
                                        >
                                            <option value="">Select temperament</option>
                                            <option value="Calm">Calm</option>
                                            <option value="Nervous">Nervous</option>
                                            <option value="Aggressive">Aggressive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-comments">
                                    <div className="form-group">
                                        <label htmlFor="comments">Comment</label>
                                        <textarea
                                            id="comments"
                                            name="comments"
                                            value={newInspection.comments || ''}
                                            onChange={handleInspectionInputChange}
                                            placeholder="Enter a comment about your hive"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="footer">
                                    <div className="button-group">
                                        <button type="button" onClick={handleCloseInspectionModal}>CANCEL</button>
                                        <button type="submit">NEXT</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            )
            }

            {
                showDiseasesModal && (
                    <div className="modal">
                        <div className="modal-content-inspect">
                            <div className="header">
                                <h2>HIVE #{selectedHive?.hiveNumber} DISEASES</h2>
                            </div>
                            <div className="from-showDis">
                                <div className="form-row">
                                    <form onSubmit={handleSubmitDiseases}>
                                        {newDiseases.map((disease, index) => (
                                            <div key={index} className="disease-entry">
                                                <div className="from-addDis">
                                                    <div className="form-group-disease">
                                                        <div className="form-group">
                                                            <label htmlFor={`disease-${index}`}>Disease #{index + 1}</label>
                                                            <select
                                                                id={`disease-${index}`}
                                                                name="diseaseName"
                                                                value={disease.diseaseName || ''}
                                                                onChange={(e) => handleDiseaseInputChange(index, e)}
                                                                required
                                                            >
                                                                <option value="">Select disease observed</option>
                                                                <option value="Varroa Mites">Varroa Mites</option>
                                                                <option value="American Foulbrood">American Foulbrood</option>
                                                                <option value="European Foulbrood">European Foulbrood</option>
                                                                <option value="Nosema">Nosema</option>
                                                                <option value="Chalkbrood">Chalkbrood</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="form-group-sverity">
                                                        <div className="form-group">
                                                            <label htmlFor={`severity-${index}`}>Severity</label>
                                                            <select
                                                                id={`severity-${index}`}
                                                                name="severity"
                                                                value={disease.severity || ''}
                                                                onChange={(e) => handleDiseaseInputChange(index, e)}
                                                                required
                                                            >
                                                                <option value="">Select severity</option>
                                                                <option value="Low">Low</option>
                                                                <option value="Medium">Medium</option>
                                                                <option value="High">High</option>
                                                                <option value="Critical">Critical</option>
                                                            </select>
                                                        </div>
                                                    </div>


                                                    <div className="form-group-description">
                                                        <div className="form-group">
                                                            <label htmlFor={`description-${index}`}>Description</label>
                                                            <textarea
                                                                id={`description-${index}`}
                                                                name="description"
                                                                value={disease.description || ''}
                                                                onChange={(e) => handleDiseaseInputChange(index, e)}
                                                                placeholder="Enter a description of the disease"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                    {index > 0 && (
                                                        <div className="form-group-remove">
                                                            <div className="button-group">
                                                                <button type="button" onClick={() => handleRemoveDisease(index)}>Remove</button>
                                                            </div>
                                                        </div>

                                                    )}
                                                </div>
                                            
                                            </div>
                                        ))}

                                        <div className="footer">
                                            <div className="button-group">
                                                <button type="button" onClick={handleAddDisease}>Add More</button>
                                                <button type="button" onClick={handleCloseDiseasesModal}>CANCEL</button>
                                                <button type="submit">SUBMIT</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>


                )
            }
        </div >

    );
};

export default Inspections;