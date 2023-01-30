export interface AgeComponent {
  birthday?: number;
}

export function getAge(modelTime: number, age?: AgeComponent) {
  const hbd = age?.birthday !== undefined ? age.birthday : 0;
  return modelTime - hbd;
}
