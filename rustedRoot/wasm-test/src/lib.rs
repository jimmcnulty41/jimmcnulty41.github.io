mod utils;

use bevy::{asset::LoadState, gltf::Gltf, prelude::*};
use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[derive(Resource)]
struct PinkSynthHandle(Handle<Gltf>, bool);

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    asset_server: Res<AssetServer>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.insert_resource(PinkSynthHandle(
        asset_server.load("../../assets/models/pink_synth.glb"),
        false,
    ));

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
    if synth.1 {
        return;
    }
    if asset_server.get_load_state(&synth.0) == LoadState::Loaded {
        let gltf = gltf_assets.get(&synth.0).unwrap();
        let gltf_scene_handle = gltf.scenes.get(0).unwrap();
        scene_spawner.spawn(gltf_scene_handle.clone_weak());
        synth.1 = true;
        info!("spawning scene...")
    }
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
        .add_systems(Startup, setup)
        .add_systems(PreUpdate, sys_spawn_on_load)
        .run();
}
