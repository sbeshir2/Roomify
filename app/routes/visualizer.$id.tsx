import { useLocation, useNavigate } from "react-router"
import {useRef, useState, useEffect} from "react";
import { Box, X, Download, Share2, RefreshCcw} from "lucide-react";
import Button from "../../components/ui/Button";
import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "../../lib/constants";

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
    if (!rawImageUrl) return { renderedImage: null };

    return { renderedImage: rawImageUrl };
};

const VisualizerId = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialImage, initialRender, name} = location.state || {};

    const hasInitialGenerated = useRef(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null);

    const handleBack = () => navigate('/');

    const runGeneration = async () => {
        if(!initialImage) return;
        console.log("runGeneration called");
        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: initialImage });

            if (result?.renderedImage) {
                setCurrentImage(result.renderedImage);
            }
        } catch (e) {
           console.error('Generation error: ', e)
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        if(!initialImage || hasInitialGenerated.current) return;

        if(initialRender) {
            setCurrentImage(initialRender);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        runGeneration();
    }, [initialImage, initialRender]);

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
                                <h2>{'Untitled Project'}</h2>
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
                                    {initialImage && (
                                        <img src={initialImage} alt="Original" className="render-fallback" />
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