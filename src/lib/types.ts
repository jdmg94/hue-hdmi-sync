
export interface BridgeClientCredentials {
    username: string;
    clientkey: string;
}

export interface HueBridgeNetworkDevice {
    id: string;
    ip: string;
    name: string;
}

export interface HueBridgeRegistration {
  id: string;
  ip: string;
  name: string;
  credentials: BridgeClientCredentials;
}

/**
 * Resource reference node used in Hue API responses
 */
export interface ResourceNode {
  rid: string;
  rtype:
    | "device"
    | "bridge_home"
    | "room"
    | "zone"
    | "light"
    | "button"
    | "temperature"
    | "light_level"
    | "motion"
    | "entertainment"
    | "grouped_light"
    | "device_power"
    | "zigbee_bridge_connectivity"
    | "zigbee_connectivity"
    | "zgp_connectivity"
    | "bridge"
    | "homekit"
    | "scene"
    | "entertainment_configuration"
    | "public_image"
    | "auth_v1"
    | "behavior_script"
    | "behavior_instance"
    | "geofence"
    | "geofence_client"
    | "geolocation"
    | "_test";
}

/**
 * 3D position coordinates
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * Entertainment area channel configuration
 */
interface EntertainmentAreaChannel {
  channel_id: number;
  position: Position[];
  members: Array<{
    index: number;
    service: ResourceNode;
  }>;
}

/**
 * Service location within an entertainment area
 */
interface ServiceLocation {
  position: Position;
  positions: Position[];
  service: ResourceNode;
}

/**
 * Entertainment area resource for streaming
 */
export interface EntertainmentArea {
  id: string;
  id_v1?: string;
  type: string;
  name: string;
  metadata: { name: string };
  channels: EntertainmentAreaChannel[];
  configuration_type: string;
  light_services: ResourceNode[];
  locations: { service_locations: ServiceLocation[] };
  status: string;
  stream_proxy: {
    mode: string;
    node: ResourceNode;
  };
}
