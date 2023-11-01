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

fn make_pickable(
    mut commands: Commands,
    gltf: Res<Assets<Gltf>>,
    anims: Res<Assets<AnimationClip>>,
    meshes: Query<(Entity, &Parent), With<Handle<Mesh>>>,
    mut players: Query<(Entity, &mut AnimationPlayer)>,
    mut count: Local<u32>,
) {
    if *count > 10 {
        return;
    }
    for (mesh, parent_id) in meshes.iter() {
        if let Ok((_, player)) = players.get(**parent_id) {
            commands.entity(mesh).insert((
                PickableBundle::default(),
                HIGHLIGHT_TINT.clone(),
                On::<Pointer<Click>>::run(|event: Listener<Pointer<Click>>| {
                    info!("Clicked on {:?}", event.target);
                }),
            ));
        }
        *count += 1;
    }
}

const HIGHLIGHT_TINT: Highlight<StandardMaterial> = Highlight {
    hovered: Some(HighlightKind::new_dynamic(|matl| StandardMaterial {
        base_color: matl.base_color + vec4(0.3, 0.3, 0.3, 0.3),
        ..matl.to_owned()
    })),
    pressed: Some(HighlightKind::new_dynamic(|matl| StandardMaterial {
        base_color: matl.base_color + vec4(0.5, 0.5, 0.5, 0.5),
        ..matl.to_owned()
    })),
    selected: Some(HighlightKind::new_dynamic(|matl| StandardMaterial {
        base_color: matl.base_color + vec4(0.5, 0.5, 0.5, 0.5),
        ..matl.to_owned()
    })),
};

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
        .add_systems(PreUpdate, make_pickable)
        .run();
}
