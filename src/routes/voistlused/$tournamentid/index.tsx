import { createFileRoute } from "@tanstack/react-router";
import ErrorPage from "../../../components/error";
import { formatDateString } from "@/lib/utils";
import { useTournament } from "./-components/tournament-provider";
import Editor from "@/routes/admin/-components/yooptaeditor";
import { useState, useMemo, useEffect } from "react";
import { YooptaContentValue } from "@yoopta/editor";
import { useTranslation } from "react-i18next";
import { Calendar, Grid3X3, MapPin, Users, ExternalLink, Navigation, RotateCcw, Building, FileText, FileSpreadsheet, Mail } from 'lucide-react';
import { ShareSection } from './-components/share-tournament';

interface YooptaEditorNode {
  id?: string;
  type?: string;
  text?: string;
  children?: YooptaEditorNode[];
  value?: YooptaEditorNode[];
  [key: string]: any;
}

export const Route = createFileRoute("/voistlused/$tournamentid/")({
  errorComponent: () => {
    return <ErrorPage />;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const tournament = useTournament();
  const { t } = useTranslation();
  const [value, setValue] = useState<YooptaContentValue | undefined>(
    tournament.information ? JSON.parse(tournament.information) : undefined
  );
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    if (!tournament.location) return;

    const geocodeLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const query = `${tournament.location}, Estonia`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ee`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setCoordinates({ lat, lng });
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    geocodeLocation();
  }, [tournament.location]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert(t('competitions.geolocation_not_supported'));
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setShowDirections(true);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(t('competitions.location_error'));
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const hasContent = useMemo(() => {
    if (!value) return false;

    const hasNonEmptyText = (obj: unknown): boolean => {
      if (!obj) return false;

      if (Array.isArray(obj)) {
        return obj.some((item) => hasNonEmptyText(item));
      }

      if (typeof obj === "object" && obj !== null) {
        const node = obj as YooptaEditorNode;

        if (
          node.text &&
          typeof node.text === "string" &&
          node.text.trim() !== ""
        ) {
          return true;
        }

        if (node.children) {
          return hasNonEmptyText(node.children);
        }

        if (node.value) {
          return hasNonEmptyText(node.value);
        }

        return Object.values(node).some((val) => hasNonEmptyText(val));
      }

      return false;
    };

    return hasNonEmptyText(value);
  }, [value]);

  if (!tournament) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">{t('competitions.errors.info_missing')}</p>
      </div>
    );
  }

  const now = new Date();
  const startDate = new Date(tournament.start_date);
  const endDate = new Date(tournament.end_date);

  const getStatusInfo = () => {
    if (endDate < now) {
      return {
        text: t('competitions.status.ended'),
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-400',
      };
    } else if (startDate <= now && endDate >= now) {
      return {
        text: t('competitions.status.ongoing'),
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        dotColor: 'bg-yellow-500',
      };
    } else {
      return {
        text: t('competitions.status.upcoming'),
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        dotColor: 'bg-green-500',
      };
    }
  };

  const status = getStatusInfo();

  const getRegistrationInfo = () => {
    const type = tournament.registration_type;
    
    switch (type) {
      case 'google_forms':
        return {
          icon: FileText,
          color: 'text-purple-600',
          bgColor: 'bg-purple-500 hover:bg-purple-700',
          text: t('competitions.registration_google_forms_description', 'Registration to this tournament is through Google Forms'),
          buttonText: t('competitions.registration_google_forms_button', 'Register via Google Forms'),
          link: tournament.registration_link,
          disabled: !tournament.registration_link
        };
      case 'excel':
        return {
          icon: FileSpreadsheet,
          color: 'text-green-600',
          bgColor: 'bg-green-500 hover:bg-green-700',
          text: t('competitions.registration_excel_description', 'Registration to this tournament is through Excel'),
          buttonText: t('competitions.registration_excel_button', 'Register via Excel'),
          link: tournament.registration_link,
          disabled: !tournament.registration_link
        };
      case 'email':
        return {
          icon: Mail,
          color: 'text-blue-600',
          bgColor: 'bg-[#4C97F1] hover:bg-blue-300',
          text: t('competitions.registration_email_description', 'Registration to this tournament is by email'),
          buttonText: tournament.registration_link || t('competitions.registration_email_not_provided', 'Email not provided'),
          link: null,
          disabled: true
        };
      case 'onsite':
      default:
        return {
          icon: Building,
          color: 'text-gray-600',
          bgColor: 'bg-gray-400',
          text: t('competitions.registration_onsite_description', 'Registration to this tournament is on-site'),
          buttonText: t('competitions.onsite_registration_only', 'Registration only on-site'),
          link: null,
          disabled: true
        };
    }
  };

  const registrationInfo = getRegistrationInfo();

  const mapsEmbedUrl = (() => {
    if (showDirections && userLocation && coordinates) {
      return `https://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${coordinates.lat},${coordinates.lng}&dirflg=d&output=embed`;
    } else if (coordinates) {
      return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    } else {
      return `https://maps.google.com/maps?q=${encodeURIComponent(tournament.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  })();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${status.dotColor} ${status.text === t('competitions.status.upcoming') ? 'animate-pulse' : ''}`}
                  />
                  {status.text}
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                {tournament.name}
              </h1>

              <div className="space-y-4 text-gray-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {formatDateString(tournament.start_date)} -{' '}
                      {formatDateString(tournament.end_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{tournament.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('competitions.registration')}
              </h3>
              <div className="flex items-center gap-3 mb-6">
                <registrationInfo.icon className={`w-5 h-5 ${registrationInfo.color}`} />
                <p className="text-gray-600">
                  {registrationInfo.text}
                </p>
              </div>
              {registrationInfo.link ? (
                <a
                  href={registrationInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full ${registrationInfo.bgColor} text-white rounded-lg py-3 px-4 font-medium transition-colors inline-flex items-center justify-center gap-2`}
                >
                  <registrationInfo.icon className="w-4 h-4" />
                  {registrationInfo.buttonText}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  className={`w-full ${registrationInfo.bgColor} text-white rounded-lg py-3 px-4 font-medium cursor-not-allowed inline-flex items-center justify-center gap-2`}
                  disabled={registrationInfo.disabled}
                >
                  <registrationInfo.icon className="w-4 h-4" />
                  {registrationInfo.buttonText}
                </button>
              )}
            </div>

            {tournament.registered_players_link && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {t('competitions.registered_players_list', 'Registered Players List')}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {t('competitions.registered_players_description', 'View the current list of registered participants')}
                      </p>
                    </div>
                  </div>
                  <a
                    href={tournament.registered_players_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#4C97F1] hover:bg-blue-700 text-white rounded-md py-2 px-3 text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    {t('competitions.view_registered_players', 'View List')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {tournament.information && hasContent && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('competitions.about_event')}
                </h2>
                <div className="prose prose-gray max-w-none bg-white border border-gray-200 rounded-xl">
                  <Editor value={value} setValue={setValue} readOnly />
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('competitions.details')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Grid3X3 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {t('competitions.tables')}
                    </p>
                    <p className="font-medium text-gray-900">
                      {tournament.total_tables}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {t('competitions.organizer')}
                    </p>
                    <p className="font-medium text-gray-900">
                      {tournament.organizer || 'ELTL'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#4C97F1]/10 to-blue-50/50 border border-[#4C97F1]/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#4C97F1] rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900">{t("competitions.location")}</h2>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-4 relative">
                {isLoadingLocation && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4C97F1] mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">{t('competitions.loading_location')}</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${tournament.name} location map`}
                ></iframe>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#4C97F1]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{tournament.location}</p>
                    <a 
                      href={coordinates 
                        ? `https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}` 
                        : `https://maps.google.com/?q=${encodeURIComponent(tournament.location)}`
                      }
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#4C97F1] hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {t("competitions.view_in_maps")} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!showDirections ? (
                    <button
                      onClick={getUserLocation}
                      disabled={isLoadingLocation}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4C97F1] hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                    >
                      <Navigation className="h-4 w-4" />
                      {isLoadingLocation ? t('competitions.getting_location') : t('competitions.get_directions')}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDirections(false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-2 px-3 text-sm font-medium transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t('competitions.show_location_only')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <ShareSection tournamentId={tournament.id.toString()} />
            
            <div className="border-t pt-6">
              <div className="space-y-2">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('competitions.contact_organizer')}
                </button>
                <span className="text-gray-400 mx-2">•</span>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('competitions.report_issue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
