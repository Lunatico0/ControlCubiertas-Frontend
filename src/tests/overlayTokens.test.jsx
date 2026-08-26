import { OVERLAY, dialogCard, neutralBtn, primaryBtn } from '@components/dialog/overlayTokens'

// t102 de la auditoría visual: DOS sistemas de overlay que no coincidían en nada. El usuario los
// ve en el MISMO flujo (crear usuario con el modal declarativo, después confirmar la baja con el
// diálogo imperativo) y no coincidían en ancho de card (420 vs 448), sombra (.55 vs .6), velo
// (.62 vs .66), tamaño de título (17 vs 16px) ni tipografía del cuerpo.
//
// OJO: la card del tablero apunta a UI/Modal.jsx, pero ese es el modal Tailwind de la app legacy.
// Los números medidos por la auditoría son los de common/Modal.jsx, que es el shell del rediseño
// y el que efectivamente usa UserForm. El informe erró el archivo.
//
// Estos tokens son ahora la única fuente: DialogHost y common/Modal los importan los dos. El test
// existe para que un valor no se pueda volver a bifurcar en silencio.

describe('tokens compartidos del overlay', () => {
  it('hay un solo velo y una sola tipografía para los dos sistemas', () => {
    expect(OVERLAY.backdrop).toBe('rgba(4,5,6,.62)')
    expect(OVERLAY.fontFamily).toContain('IBM Plex Sans')
  })

  it('la card tiene un solo radio y una sola sombra', () => {
    expect(dialogCard.borderRadius).toBe(14)
    expect(dialogCard.boxShadow).toBe(OVERLAY.shadow)
  })

  it('los dos botones del pie miden lo mismo: nada de 44 contra 43', () => {
    expect(neutralBtn.height).toBe(primaryBtn.height)
    expect(neutralBtn.borderRadius).toBe(primaryBtn.borderRadius)
    expect(neutralBtn.fontSize).toBe(primaryBtn.fontSize)
  })

  it('el título del header es uno solo', () => {
    expect(OVERLAY.titleSize).toBe(17)
    expect(OVERLAY.titleFont).toContain('Space Grotesk')
  })
})
