import { useState, useRef } from 'react'

interface ImportExportModalProps {
    tournamentName: string
    tournamentDescription: string
    onNameChange: (name: string) => void
    onDescriptionChange: (description: string) => void
    onExport: () => void
    onImport: (file: File) => void
    onGenerateSchema: () => void
    onClose: () => void
    estimatedDuration: number
    totalPlayers: number
}

export default function ImportExportModal({
    tournamentName,
    tournamentDescription,
    onNameChange,
    onDescriptionChange,
    onExport,
    onImport,
    onGenerateSchema,
    onClose,
    estimatedDuration,
    totalPlayers
}: ImportExportModalProps) {
    const [activeTab, setActiveTab] = useState<'export' | 'import' | 'schema'>('export')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/json') {
            onImport(file)
        } else {
            alert('Please select a valid JSON file')
        }
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Tournament Import/Export</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'export'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📤 Export
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'import'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📥 Import
                    </button>
                    <button
                        onClick={() => setActiveTab('schema')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'schema'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📋 Schema
                    </button>
                </div>

                <div className="overflow-y-auto max-h-80">
                    {/* Export Tab */}
                    {activeTab === 'export' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tournament Name</label>
                                    <input
                                        type="text"
                                        value={tournamentName}
                                        onChange={(e) => onNameChange(e.target.value)}
                                        placeholder="Enter tournament name"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={tournamentDescription}
                                        onChange={(e) => onDescriptionChange(e.target.value)}
                                        placeholder="Tournament description (optional)"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                            </div>

                            {/* Tournament Stats */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Tournament Overview</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Total Players:</span>
                                        <span className="ml-2 font-medium">{totalPlayers}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Estimated Duration:</span>
                                        <span className="ml-2 font-medium">{formatDuration(estimatedDuration)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Tournament Blocks:</span>
                                        <span className="ml-2 font-medium">{totalPlayers > 0 ? 'Configured' : 'Empty'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Format:</span>
                                        <span className="ml-2 font-medium">JSON v1.0</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={onExport}
                                    disabled={!tournamentName.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    📤 Export Tournament
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Import Tab */}
                    {activeTab === 'import' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="text-4xl mb-2">📥</div>
                                <h4 className="text-lg font-medium mb-2">Import Tournament</h4>
                                <p className="text-gray-600 mb-4">
                                    Select a JSON file exported from Tournament Builder
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Select JSON File
                                </button>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <span className="text-yellow-600 mr-2">⚠️</span>
                                    <div>
                                        <h5 className="font-medium text-yellow-800">Import Warning</h5>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Importing will replace your current tournament configuration.
                                            Make sure to export your current work first if you want to keep it.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-medium text-blue-800 mb-2">Supported Features</h5>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>✅ Tournament blocks and connections</li>
                                    <li>✅ Player lists and configurations</li>
                                    <li>✅ Match settings and schedules</li>
                                    <li>✅ Tournament metadata</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Schema Tab */}
                    {activeTab === 'schema' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">JSON Schema Information</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    The Tournament Builder uses a structured JSON schema to ensure compatibility
                                    and data integrity when importing/exporting tournament configurations.
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <h5 className="font-medium text-sm">Schema Version</h5>
                                        <p className="text-sm text-gray-600">Current: v1.0.0</p>
                                    </div>

                                    <div>
                                        <h5 className="font-medium text-sm">File Structure</h5>
                                        <div className="bg-white p-3 rounded border text-xs font-mono">
                                            <div>{'{'}</div>
                                            <div>&nbsp;&nbsp;"version": "1.0.0",</div>
                                            <div>&nbsp;&nbsp;"createdAt": "ISO-8601-timestamp",</div>
                                            <div>&nbsp;&nbsp;"tournament": {'{'}</div>
                                            <div>&nbsp;&nbsp;&nbsp;&nbsp;"name": "Tournament Name",</div>
                                            <div>&nbsp;&nbsp;&nbsp;&nbsp;"blocks": [...],</div>
                                            <div>&nbsp;&nbsp;&nbsp;&nbsp;"connections": [...],</div>
                                            <div>&nbsp;&nbsp;&nbsp;&nbsp;"metadata": {'{ ... }'}</div>
                                            <div>&nbsp;&nbsp;{'}'}</div>
                                            <div>{'}'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={onGenerateSchema}
                                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                                >
                                    📋 Download JSON Schema
                                </button>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h5 className="font-medium text-green-800 mb-2">Developer Features</h5>
                                <ul className="text-sm text-green-700 space-y-1">
                                    <li>✅ JSON Schema validation</li>
                                    <li>✅ Version compatibility checking</li>
                                    <li>✅ Automatic data migration</li>
                                    <li>✅ Error handling and recovery</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
