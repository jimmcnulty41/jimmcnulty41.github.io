mod utils;

use bevy::{
    asset::LoadState,
    gltf::{Gltf, GltfNode},
    math::vec4,
    prelude::*,
    scene::{self, InstanceId},
};
use bevy_mod_picking::{
    prelude::{Click, Highlight, HighlightKind, Listener, On, Pointer},
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

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    asset_server: Res<AssetServer>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.spawn(SceneBundle {
        scene: asset_server.load("../../assets/models/pink_synth.glb#Scene0"),
        ..default()
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

fn make_pickable(mut commands: Commands, query: Query<Entity, With<Handle<Mesh>>>) {
    for blah in query.iter() {
        commands
            .entity(blah)
            .insert((PickableBundle::default(), HIGHLIGHT_TINT.clone()));
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
        .add_plugins(DefaultPickingPlugins)
        .add_systems(Startup, setup)
        .run();
}
