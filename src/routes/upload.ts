import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '@/config/cloudinary';

const router = Router();

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

// Upload de imagem
router.post('/image', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Determinar pasta baseada no contexto
    const folder = req.body.folder || 'users';
    const finalFolder = `${folder}/${req.user.userId}`;

    // Fazer upload para o Cloudinary
    const result = await uploadImage(req.file, finalFolder);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: result,
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Upload de múltiplas imagens
router.post('/images', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Determinar pasta baseada no contexto
    const folder = req.body.folder || 'users';
    const finalFolder = `${folder}/${req.user.userId}`;

    // Fazer upload de múltiplas imagens
    const files = req.files as Express.Multer.File[];
    const uploadPromises = files.map(file => uploadImage(file, finalFolder));
    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Imagens enviadas com sucesso',
      data: results,
    });
  } catch (error) {
    console.error('Erro no upload de múltiplas imagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar imagem
router.delete('/image/:publicId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({
        success: false,
        error: 'ID da imagem é obrigatório',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Verificar se a imagem pertence ao usuário (implementar verificação se necessário)
    await deleteImage(publicId);

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Middleware de tratamento de erros do multer
router.use((error: any, req: Request, res: Response, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Muitos arquivos. Máximo permitido: 10 arquivos',
      });
      return;
    }
  }

  if (error.message === 'Tipo de arquivo não permitido') {
    res.status(400).json({
      success: false,
      error: 'Tipo de arquivo não permitido. Tipos aceitos: JPEG, PNG, WebP',
    });
    return;
  }

  console.error('Erro no upload:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
  });
});

export default router; 