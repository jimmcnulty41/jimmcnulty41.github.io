mod utils;

use std::thread::spawn;

use bevy::animation::AnimationClip;
use bevy::scene::SceneInstance;
use bevy::{math::vec4, prelude::*};
use bevy_inspector_egui::quick::WorldInspectorPlugin;
use bevy_mod_picking::{
    prelude::{Click, Highlight, HighlightKind, ListenerInput, On, Pickable, Pointer},
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

const SYNTH_PATH: &str = "../../assets/models/pink_synth.glb";
#[derive(Event)]
struct SynthKeyPress(Entity);

impl From<ListenerInput<Pointer<Click>>> for SynthKeyPress {
    fn from(event: ListenerInput<Pointer<Click>>) -> Self {
        SynthKeyPress(event.target)
    }
}

fn sys_on_synth_key_press(
    mut commands: Commands,
    mut key_event: EventReader<SynthKeyPress>,
    anims: Res<Animations>,
    synth_key_ents: Query<&Parent, With<Pickable>>,
    mut an_player_ents: Query<(&Name, &mut AnimationPlayer)>,
) {
    for ev in key_event.iter() {
        if let Ok(parent) = synth_key_ents.get(ev.0) {
            if let Ok((name, mut p)) = an_player_ents.get_mut(**parent) {
                p.resume();
                if let Some(blah) = anims.get(name.to_string()) {
                    p.play(blah.clone());
                }
            }
        }
    }
}

#[derive(Resource, Reflect)]
struct Animations(Vec<(String, Handle<AnimationClip>)>);

impl Animations {
    fn get(&self, name: String) -> Option<&Handle<AnimationClip>> {
        info!("Animations::get({})", name);
        let mut clip = None;
        for (n, c) in self.0.iter() {
            info!("Clip with name {}", n);
            if n.eq(&name) {
                clip = Some(c);
                break;
            }
        }
        clip
    }
}

fn sys_synth_setup(mut commands: Commands, ass: Res<AssetServer>) {
    info!("Synth setup BEGIN");
    commands.spawn(SceneBundle {
        scene: ass.load(format!("{}#Scene0", SYNTH_PATH)),
        ..default()
    });
    info!("Synth setup {}", format!("{}#Scene0", SYNTH_PATH));
    commands.insert_resource(Animations(vec![
        (
            "key_1".to_string(),
            ass.load(format!("{}#Animation0", SYNTH_PATH)),
        ),
        (
            "key_2".to_string(),
            ass.load(format!("{}#Animation1", SYNTH_PATH)),
        ),
        (
            "key_3".to_string(),
            ass.load(format!("{}#Animation2", SYNTH_PATH)),
        ),
        (
            "key_4".to_string(),
            ass.load(format!("{}#Animation3", SYNTH_PATH)),
        ),
        (
            "key_5".to_string(),
            ass.load(format!("{}#Animation4", SYNTH_PATH)),
        ),
        (
            "key_6".to_string(),
            ass.load(format!("{}#Animation5", SYNTH_PATH)),
        ),
        (
            "key_7".to_string(),
            ass.load(format!("{}#Animation6", SYNTH_PATH)),
        ),
    ]));
    info!("Synth setup END");
}

fn sys_make_synth_keys_pickable(
    mut commands: Commands,
    meshes: Query<(Entity, &Parent), With<Handle<Mesh>>>,
    players: Query<(Entity, &mut AnimationPlayer, &Name)>,
    mut count: Local<u32>,
) {
    if *count > 10 {
        return;
    }
    for (mesh, parent_id) in meshes.iter() {
        if let Ok(_) = players.get(**parent_id) {
            commands.entity(mesh).insert((
                PickableBundle::default(),
                HIGHLIGHT_TINT.clone(),
                On::<Pointer<Click>>::send_event::<SynthKeyPress>(),
            ));
            *count += 1;
        }
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
        .add_plugins(WorldInspectorPlugin::new())
        .add_plugins(DefaultPickingPlugins)
        .add_event::<SynthKeyPress>()
        .add_systems(Startup, (setup, sys_synth_setup))
        .add_systems(PreUpdate, sys_make_synth_keys_pickable)
        .add_systems(
            Update,
            sys_on_synth_key_press.run_if(on_event::<SynthKeyPress>()),
        )
        .run();
}
