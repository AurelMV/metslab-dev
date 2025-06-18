<?php

namespace App\Http\Controllers;

use App\Models\Modelo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Exception;

class ModeloController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $modelos = Modelo::all();

            $data = $modelos->map(function ($modelo) {
                $modelo_url = asset($modelo->ruta_modelo);
                $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;




                return [
                    'idModelo' => $modelo->idModelo,
                    'idCategoria' => $modelo->idCategoria,
                    'nombreCategoria' => $modelo->categoria->nombre,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'estado' => $modelo->estado,
                    'modelo_url' => $modelo_url,
                    'imagen_url' => $imagen_url,

                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener los modelos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:45',
                'descripcion' => 'nullable|string|max:255',
                'dimensiones' => 'nullable|string|max:45',
                'modelo_3d' => 'required|file|mimes:obj,txt|max:18240',


                'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'precio' => 'required|integer|min:0',
                'idCategoria' => 'nullable|exists:categorias,idCategoria'
            ], [
                'modelo_3d.mimes' => 'El modelo 3D debe ser un archivo .obj',
                'modelo_3d.max' => 'El modelo 3D no debe exceder 10MB',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear directorios si no existen
            Storage::makeDirectory('public/modelos');
            Storage::makeDirectory('public/imagenes');

            // Procesar modelo 3D con extensión original
            $modelo3DFile = $request->file('modelo_3d');
            $nombreArchivoModelo = uniqid() . '.' . $modelo3DFile->getClientOriginalExtension();
            $rutaModelo = $modelo3DFile->storeAs('modelos', $nombreArchivoModelo, 'public');
            $rutaModeloPublica = Storage::url($rutaModelo);

            // Procesar imagen
            $rutaImagenPublica = null;
            if ($request->hasFile('imagen')) {
                $imagenFile = $request->file('imagen');
                $nombreArchivoImagen = uniqid() . '.' . $imagenFile->getClientOriginalExtension();
                $rutaImagen = $imagenFile->storeAs('imagenes', $nombreArchivoImagen, 'public');
                $rutaImagenPublica = Storage::url($rutaImagen);
            }

            // Guardar en BD
            $modelo = Modelo::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'dimensiones' => $request->dimensiones,
                'ruta_modelo' => $rutaModeloPublica,
                'ruta_imagen' => $rutaImagenPublica,
                'precio' => $request->precio,
                'idCategoria' => $request->idCategoria
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Modelo guardado exitosamente',
                'data' => $modelo,
                'modelo_url' => asset($rutaModeloPublica),
                'imagen_url' => $rutaImagenPublica ? asset($rutaImagenPublica) : null
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Error al procesar la solicitud: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $modelo = Modelo::with('categoria')->findOrFail($id);

            $modelo_url = asset($modelo->ruta_modelo);
            $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

            return response()->json([
                'success' => true,
                'data' => [
                    'idModelo' => $modelo->idModelo,
                    'idCategoria' => $modelo->idCategoria,
                    'nombreCategoria' => $modelo->categoria->nombre,
                    'descripcion' => $modelo->descripcion,
                    'dimensiones' => $modelo->dimensiones,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'modelo_url' => $modelo_url,
                    'imagen_url' => $imagen_url,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener el modelo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $modelo = Modelo::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:45',
                'descripcion' => 'nullable|string|max:255',
                'dimensiones' => 'nullable|string|max:45',
                'modelo_3d' => 'nullable|file|mimes:obj,txt|max:18240',
                'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
                'precio' => 'sometimes|required|integer|min:0',
                'idCategoria' => 'nullable|exists:categorias,idCategoria',
                'estado' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // Actualizar campos básicos
            $modelo->nombre = $request->input('nombre', $modelo->nombre);
            $modelo->descripcion = $request->input('descripcion', $modelo->descripcion);
            $modelo->dimensiones = $request->input('dimensiones', $modelo->dimensiones);
            $modelo->precio = $request->input('precio', $modelo->precio);
            $modelo->estado = $request->input('estado', $modelo->estado);
            $modelo->idCategoria = $request->input('idCategoria', $modelo->idCategoria);

            // Actualizar modelo 3D si se sube uno nuevo
            if ($request->hasFile('modelo_3d')) {
                // Eliminar archivo anterior si existe
                if ($modelo->ruta_modelo && Storage::disk('public')->exists(str_replace('/storage/', '', $modelo->ruta_modelo))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $modelo->ruta_modelo));
                }

                $modelo3DFile = $request->file('modelo_3d');
                $nombreArchivoModelo = uniqid() . '.' . $modelo3DFile->getClientOriginalExtension();
                $rutaModelo = $modelo3DFile->storeAs('modelos', $nombreArchivoModelo, 'public');
                $modelo->ruta_modelo = Storage::url($rutaModelo);
            }

            // Actualizar imagen si se sube una nueva
            if ($request->hasFile('imagen')) {
                if ($modelo->ruta_imagen && Storage::disk('public')->exists(str_replace('/storage/', '', $modelo->ruta_imagen))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $modelo->ruta_imagen));
                }

                $imagenFile = $request->file('imagen');
                $nombreArchivoImagen = uniqid() . '.' . $imagenFile->getClientOriginalExtension();
                $rutaImagen = $imagenFile->storeAs('imagenes', $nombreArchivoImagen, 'public');
                $modelo->ruta_imagen = Storage::url($rutaImagen);
            }

            $modelo->save();

            return response()->json([
                'success' => true,
                'message' => 'Modelo actualizado correctamente',
                'data' => $modelo
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al actualizar el modelo: ' . $e->getMessage()
            ], 500);
        }
    }



    public function RecursoCatalogo()
    {
        try {
            // Solo obtener modelos con estado true
            $modelos = Modelo::where('estado', true)->get();

            $data = $modelos->map(function ($modelo) {
                $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

                return [
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'idModelo' => $modelo->idModelo,
                    'imagen_url' => $imagen_url,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener los modelos: ' . $e->getMessage()
            ], 500);
        }
    }

    public function modelosPorCategoria($idCategoria)
    {
        try {
            $modelos = Modelo::with('categoria')
                ->where('idCategoria', $idCategoria)
                ->get();

            $data = $modelos->map(function ($modelo) {
                $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

                return [
                    'idModelo' => $modelo->idModelo,
                    'nombre' => $modelo->nombre,
                    'precio' => $modelo->precio,
                    'imagen_url' => $imagen_url,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener los modelos por categoría: ' . $e->getMessage()
            ], 500);
        }
    }


    public function Imagenmodelo($id)
    {
        try {
            $modelo = Modelo::with('categoria')->findOrFail($id);

            $modelo_url = asset($modelo->ruta_modelo);
            $imagen_url = $modelo->ruta_imagen ? asset($modelo->ruta_imagen) : null;

            return response()->json([
                'success' => true,
                'data' => [

                    'imagen_url' => $imagen_url,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener el modelo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function Cargamodelo($id)
    {
        try {
            $modelo = Modelo::with('categoria')->findOrFail($id);

            $filename = basename($modelo->ruta_modelo); // Extrae el nombre del archivo
            $modelo_url = url('/api/modelo-obj/' . $filename);

            return response()->json([
                'success' => true,
                'data' => [
                    'modelo_url' => $modelo_url,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '❌ Error al obtener el modelo: ' . $e->getMessage()
            ], 500);
        }
    }
}
