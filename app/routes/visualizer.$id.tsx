import { useNavigate, useParams, useOutletContext, useLocation} from "react-router"
import {useRef, useState, useEffect} from "react";
import { Box, X, Download, Share2, RefreshCcw} from "lucide-react";
import Button from "../../components/ui/Button";
import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "../../lib/constants";
import { createProject, getProjectById } from "../../lib/puter.action";

const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
    
    const dataUrl = sourceImage.startsWith('data:')
        ? sourceImage 
        : await fetch(sourceImage).then(r => r.blob()).then(b => new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.onerror = rej;
            reader.readAsDataURL(b);
        }));

    const base64Data = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    if(!mimeType || !base64Data) throw new Error('Invalid source image payload');

    const response = await (puter.ai as any).txt2img(ROOMIFY_RENDER_PROMPT, {   
        provider: 'gemini',
        model: 'gemini-2.5-flash-image-preview',
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024}
    });

    const rawImageUrl = (response as HTMLImageElement).src ?? null;
    if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

return { renderedImage: rawImageUrl, renderedPath: undefined };
};

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useOutletContext<AuthContext>()
    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const handleBack = () => navigate('/');

    const runGeneration = async (item: DesignItem) => {
        if(!id || !item.sourceImage) return;
        console.log("runGeneration called");
        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: item.sourceImage });

            if (result?.renderedImage) {
                setCurrentImage(result.renderedImage);


                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false

                }

                const saved = await createProject({ item: updatedItem, visibility: "private" })

                if (saved) {
                    setProject(saved);
                    setCurrentImage(saved.renderedImage || result.renderedImage);
                }

            }
        } catch (e) {
           console.error('Generation error: ', e)
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
    };
  }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
        return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);
       

    return (
        <div className="visualizer"> 
                <nav className="topbar">
                    <div className="brand" > 
                        <Box className="logo" />
                        <span className="name">Roomify</span>
                    </div> 
                    <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                        <X className="icon" />Exit Editor
                    </Button>
                </nav>

                <section className="content">
                    <div className="panel">
                        <div className="panel-header">
                            <div className="panel-meta">
                                <p>Project</p>
                                <h2>{project?.name || `Residence ${id}`}</h2>
                                <p className="note">Created by You</p>
                            </div>

                            <div className="panel-actions">
                                <Button 
                                    size="sm"
                                    onClick={() => {}}
                                    className="export"
                                    disabled={!currentImage}
                                >
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </Button> 
                                <Button size="sm" onClick={() => {}} className="share">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>

                        <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                            {currentImage ? (
                                <img src={currentImage} alt="AI Render" className="render-img" />
                            ) : (
                                <div className="render-placeholder">
                                    {project?.sourceImage && (
                                        <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                                    )}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
                                        <RefreshCcw className="spinner" />
                                        <span className="title">Rendering...</span>
                                        <span className="subtitle">Generating your 3D visualization</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
        </div>
    )
}
export default VisualizerId