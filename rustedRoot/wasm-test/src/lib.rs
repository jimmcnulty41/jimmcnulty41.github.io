mod utils;

use bevy::{
    asset::LoadState,
    gltf::{Gltf, GltfNode},
    prelude::*,
    scene::{self, InstanceId},
};
use bevy_mod_picking::{
    prelude::{Click, Listener, On, Pointer},
    *,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[derive(Resource)]
struct PinkSynthHandle {
    pub gltf_handle: Handle<Gltf>,
    pub scene_spawner_id: Option<InstanceId>,
    pub is_loaded: bool,
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    asset_server: Res<AssetServer>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.insert_resource(PinkSynthHandle {
        gltf_handle: asset_server.load("../../assets/models/pink_synth.glb"),
        scene_spawner_id: None,
        is_loaded: false,
    });

    commands.spawn(PbrBundle {
        mesh: meshes.add(shape::Plane::from_size(5.0).into()),
        material: materials.add(Color::rgb(0.3, 0.5, 0.3).into()),
        ..default()
    });
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 1500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(4.0, 8.0, 4.0),
        ..default()
    });
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 1500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(-4.0, 8.0, -4.0),
        ..default()
    });
}

fn sys_spawn_on_load(
    asset_server: Res<AssetServer>,
    gltf_assets: Res<Assets<Gltf>>,
    mut synth: ResMut<PinkSynthHandle>,
    mut scene_spawner: ResMut<SceneSpawner>,
) {
    if synth.is_loaded {
        return;
    }
    if asset_server.get_load_state(&synth.gltf_handle) == LoadState::Loaded {
        let gltf = gltf_assets.get(&synth.gltf_handle).unwrap();
        let gltf_scene_handle = gltf.scenes.get(0).unwrap();
        synth.scene_spawner_id = Some(scene_spawner.spawn(gltf_scene_handle.clone_weak()));
        synth.is_loaded = true;
        info!("spawning scene...")
    }
}

#[derive(Resource)]
struct KeysLinked(bool);

fn sys_link_synth_keys(
    mut commands: Commands,
    mut synth: ResMut<PinkSynthHandle>,
    gltf_assets: Res<Assets<Gltf>>,
    mut scenes: ResMut<Assets<Scene>>,
    mut scene_spawner: ResMut<SceneSpawner>,
    mut keys_linked: ResMut<KeysLinked>,
    animations_q: Query<Entity, With<Handle<Mesh>>>,
) {
    if keys_linked.0 {
        return;
    }
    info!("sys_link_synth_keys: BEGIN");
    if let Some(gltf) = gltf_assets.get(&synth.gltf_handle) {
        if let Some(scene_handle) = &gltf.default_scene {
            if let Some(scene) = scenes.get_mut(scene_handle) {
                // get the right entity
                for e in animations_q.iter() {
                    commands.entity(e).insert((
                        PickableBundle::default(),
                        On::<Pointer<Click>>::run(|ev: Listener<Pointer<Click>>| {
                            info!("Clicked {:?}", ev.target);
                        }),
                    ));
                }

                keys_linked.0 = true;
                info!("sys_link_synth_keys: scene is loaded and manipulated");
            } else {
                info!("sys_link_synth_keys: MISSING scene");
            }
        } else {
            info!("sys_link_synth_keys: MISSING scene handle");
        }
    } else {
        info!("sys_link_synth_keys: MISSING GLTF");
    }
    info!("sys_link_synth_keys: END");
}

#[wasm_bindgen(start)]
pub fn bevy_main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                canvas: Some("#bevy_canvas".to_string()),
                fit_canvas_to_parent: true,
                ..default()
            }),
            ..default()
        }))
        .insert_resource(KeysLinked(false))
        .add_plugins(DefaultPickingPlugins)
        .add_systems(Startup, setup)
        .add_systems(PreUpdate, (sys_spawn_on_load, sys_link_synth_keys))
        .run();
}
